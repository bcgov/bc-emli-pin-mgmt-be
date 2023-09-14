import { UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ActivePin } from '../entity/ActivePin';
import { PinAuditLog } from '../entity/PinAuditLog';
import { emailPhone, expirationReason, roleType } from '../helpers/types';
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
    pids: string,
    role: roleType,
): Promise<any> {
    const PINRepo = await AppDataSource.getRepository(ActivePin);
    let query = {};
    if (role === roleType.SuperAdmin) {
        query = {
            select: {
                livePinId: true,
                pids: true,
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
                provinceAbbreviation: true,
                provinceLong: true,
                country: true,
                postalCode: true,
            },
            where: { pids: pids },
        };
    } else {
        query = {
            select: {
                livePinId: true,
                pids: true,
                titleNumber: true,
                landTitleDistrict: true,
                givenName: true,
                lastName_1: true,
                lastName_2: true,
                incorporationNumber: true,
                addressLine_1: true,
                addressLine_2: true,
                city: true,
                provinceAbbreviation: true,
                provinceLong: true,
                country: true,
                postalCode: true,
            },
            where: { pids: pids },
        };
    }
    const result = await PINRepo.find(query);
    return result;
}

export async function deletePin(
    id: string,
    reason: expirationReason,
    expiredByUsername: string,
): Promise<ActivePin | undefined> {
    const transactionReturn = (await AppDataSource.transaction(
        async (manager) => {
            const PINToDelete = await manager.findOneOrFail(ActivePin, {
                where: { livePinId: id },
            });
            await manager.remove(ActivePin, PINToDelete); // deletes and creates an entry in the audit log via trigger
            // Update deletion info with expiration reason
            const log = await manager.findOneOrFail(PinAuditLog, {
                order: {
                    logCreatedAt: 'DESC', // looking for most recent log
                },
                where: { livePinId: id },
            });
            const logInfo = await manager.update(
                PinAuditLog,
                { logId: log.logId },
                {
                    expirationReason: reason,
                    alteredByUsername: expiredByUsername,
                },
            );
            // TO DO: Query for User ID???
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

/**
 * Batch save pins that need an update, while also properly up[dating the logs
 * @param updatedPins The Array of pins with changes to save
 * @param sendToInfo The email and/or phone number of who the new pin should be sent to
 * @param requesterName The person requesting the (re)creation. Can be blank if it's the person themselves
 * @param requesterUsername The username of the person requesting the (re)creation. Can be blank if it's the person themselves
 * @returns An array of errors that occured / entries that were not processed, or an empty array upon total success.
 */
export async function batchUpdatePin(
    updatedPins: ActivePin[],
    sendToInfo: emailPhone,
    requesterUsername?: string,
): Promise<string[]> {
    const errors = [];
    let expireUsername: string, reason: expirationReason, logInfo;
    if (!requesterUsername) {
        expireUsername = 'self';
        reason = expirationReason.OnlineReset;
    } else {
        expireUsername = requesterUsername;
        reason = expirationReason.CallCenterPinReset;
    }
    let transactionReturn;

    for (let i = 0; i < updatedPins.length; i++) {
        try {
            transactionReturn = (await AppDataSource.transaction(
                async (manager) => {
                    await manager.save(updatedPins[i]); // this fires the trigger to create an audit log
                    // Update the log with the correct info
                    const log = await manager.findOneOrFail(PinAuditLog, {
                        order: {
                            logCreatedAt: 'DESC', // looking for most recent log
                        },
                        where: { livePinId: updatedPins[i].livePinId },
                    });
                    let updateInfo;
                    if (log.expiredAt != null) {
                        updateInfo = {
                            expirationReason: reason,
                            alteredByUsername: expireUsername, // TODO: Join on user GUID
                            sentToEmail: sendToInfo.email,
                            sentToPhone: sendToInfo.phoneNumber,
                        };
                    } else {
                        updateInfo = {
                            alteredByUsername: expireUsername,
                            sentToEmail: sendToInfo.email,
                            sentToPhone: sendToInfo.phoneNumber,
                        };
                    }
                    logInfo = await manager.update(
                        PinAuditLog,
                        { logId: log.logId },
                        updateInfo,
                    );
                    return { logInfo };
                },
            )) as { logInfo: UpdateResult };
        } catch (err) {
            if (err instanceof Error) {
                const message = `An error occured while updating updatedPins[${i}] in batchUpdatePin: ${err.message}`;
                logger.warn(message);
                errors.push(message);
                continue;
            }
        }

        if (
            typeof transactionReturn != 'undefined' &&
            typeof transactionReturn.logInfo != 'undefined' &&
            transactionReturn.logInfo &&
            transactionReturn.logInfo.affected &&
            transactionReturn.logInfo.affected !== 0
        ) {
            logger.debug(
                `Successfully updated ActivePIN with live_pin_id '${updatedPins[i].livePinId}}'`,
            );
        } else {
            const message = `An error occured while updating updatedPins[${i}] in batchUpdatePin: No rows were affected by the update`;
            logger.warn(message);
            errors.push(message);
        }
    }
    return errors;
}
