import { UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ActivePin } from '../entity/ActivePin';
import { PinAuditLog } from '../entity/PinAuditLog';
import { expirationReason } from '../helpers/types';
import logger from '../middleware/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findPin(
    select?: object,
    where?: object,
): Promise<ActivePin[] | any> {
    const PINRepo = await AppDataSource.getRepository(ActivePin);
    const query = {
        select: select ? select : undefined,
        where: where ? where : undefined,
    };
    let result;
    if (query.where === undefined && query.select === undefined) {
        result = await PINRepo.find();
    } else {
        result = await PINRepo.find(query);
    }
    return result;
}

export async function findPropertyDetails(
    pid: number,
    role: string,
): Promise<any> {
    const PINRepo = await AppDataSource.getRepository(ActivePin);
    let query = {};
    if (role === 'SuperAdmin') {
        query = {
            select: {
                pid: true,
                pin: true,
                titleNumber: true,
                landTitleDistrict: true,
                givenName: true,
                lastName_1: true,
                lastName_2: true,
                incorporationNumber: true,
                addressLine_1: true,
                addressLine_2: true,
                city: true,
                province: true,
                otherGeographicDivision: true,
                country: true,
                postalCode: true,
            },
            where: { pid: pid },
        };
    } else {
        query = {
            select: {
                pid: true,
                titleNumber: true,
                landTitleDistrict: true,
                givenName: true,
                lastName_1: true,
                lastName_2: true,
                incorporationNumber: true,
                addressLine_1: true,
                addressLine_2: true,
                city: true,
                province: true,
                otherGeographicDivision: true,
                country: true,
                postalCode: true,
            },
            where: { pid: pid },
        };
    }
    const result = await PINRepo.find(query);
    return result;
}

export async function deletePin(
    id: string,
    reason: expirationReason,
    expiredByName: string,
    expiredByUsername: string,
): Promise<ActivePin | undefined> {
    const transactionReturn = (await AppDataSource.transaction(
        async (manager) => {
            const PINToDelete = await manager.findOneOrFail(ActivePin, {
                where: { livePinId: id },
            });
            await manager.remove(ActivePin, PINToDelete); // deletes and creates an entry in the audit log via trigger
            // Update deletion info with expiration reason
            const logInfo = await manager.update(
                PinAuditLog,
                { livePinId: id },
                { expirationReason: reason, expiredByName, expiredByUsername },
            );
            return { PINToDelete, logInfo };
        },
    )) as { PINToDelete: ActivePin; logInfo: UpdateResult };
    if (typeof transactionReturn.logInfo != 'undefined') {
        if (
            transactionReturn.logInfo.affected &&
            transactionReturn.logInfo.affected === 1
        ) {
            logger.debug(
                `Successfully deleted ActivePIN with live_pin_id '${id}'`,
            );
            return transactionReturn.PINToDelete;
        }
    }
}
