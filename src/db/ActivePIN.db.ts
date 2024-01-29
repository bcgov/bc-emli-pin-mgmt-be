import { IsNull, Like, Not, UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source';
import { ActivePin } from '../entity/ActivePin';
import { PinAuditLog } from '../entity/PinAuditLog';
import {
    emailPhone,
    expirationReason,
    expireRequestBody,
} from '../helpers/types';
import logger from '../middleware/logger';
import { PINController } from '../controllers/pinController';
import { sendCreateRegenerateOrExpireNotification } from '../helpers/GCNotifyCalls';

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
    pids: string[],
    permissions: string[],
): Promise<any> {
    const PINRepo = await AppDataSource.getRepository(ActivePin);
    let query = {};
    let where: any[] | object = [];
    if (pids.length === 0) {
        throw new Error(`No pids available for search`);
    }
    if (pids.length === 1) {
        where = { pids: Like(`%` + pids[0] + `%`) };
    } else {
        where = [];
        for (let i = 0; i < pids.length; i++) {
            (where as any[]).push({ pids: Like(`%` + pids[i] + `%`) });
        }
    }
    /*
     * We don't check the 'PROPERTY_SEARCH' permission here as it is already checked
     * in the only endpoint that uses this function.
     */
    if (permissions.includes('VIEW_PIN')) {
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
            where,
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
            where,
        };
    }
    const result = await PINRepo.find(query);
    return result;
}

export async function deletePin(
    requestBody: expireRequestBody,
    id: string,
    reason: expirationReason,
    expiredByUsername: string,
): Promise<ActivePin | undefined> {
    const controller = new PINController();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const faults = await controller.pinRequestBodyValidate(requestBody);
    const emailTemplateId: string =
        process.env.GC_NOTIFY_EXPIRE_EMAIL_TEMPLATE_ID!;
    const phoneTemplateId: string =
        process.env.GC_NOTIFY_EXPIRE_PHONE_TEMPLATE_ID!;

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
            if (reason !== expirationReason.ChangeOfOwnership) {
                // etl should not send a notification
                const notificationResponse =
                    await sendCreateRegenerateOrExpireNotification(
                        requestBody,
                        emailTemplateId,
                        phoneTemplateId,
                        PINToDelete,
                    );
                if (notificationResponse) {
                    return { PINToDelete, logInfo };
                } else {
                    throw new Error(
                        `Error calling sendCreateRegenerateOrExpireNotification`,
                    );
                }
            } else {
                return { PINToDelete, logInfo };
            }
        },
    )) as { PINToDelete: ActivePin; logInfo: UpdateResult };

    if (typeof transactionReturn?.logInfo != 'undefined') {
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
 * Batch save pins that need an update, while also properly updating the logs
 * @param updatedPins The Array of pins with changes to save
 * @param sendToInfo The email and/or phone number of who the new pin should be sent to
 * @param requesterName The person requesting the (re)creation. Can be blank if it's the person themselves
 * @param requesterUsername The username of the person requesting the (re)creation. Can be blank if it's the person themselves
 * @returns An array of errors that occured / entries that were not processed, or an empty array upon total success.
 */
export async function batchUpdatePin(
    updatedPins: ActivePin[],
    sendToInfo: emailPhone,
    propertyAddress: string,
    requesterUsername?: string,
    requesterName?: string,
): Promise<[string[], string]> {
    const errors = [];
    const regenerateOrCreate = '';
    let expireUsername: string,
        expireName: string,
        reason: expirationReason,
        logInfo: UpdateResult;
    if (!requesterUsername || !requesterName) {
        expireUsername = 'Self';
        expireName = 'Self Requested';
        reason = expirationReason.OnlineReset;
    } else {
        expireUsername = requesterUsername;
        expireName = requesterName;
        reason = expirationReason.CallCenterPinReset;
    }
    let emailTemplateId: string;
    let phoneTemplateId: string;
    let transactionReturn;

    for (let i = 0; i < updatedPins.length; i++) {
        try {
            transactionReturn = (await AppDataSource.transaction(
                async (manager) => {
                    const pin = await manager.findOne(ActivePin, {
                        where: {
                            livePinId: updatedPins[i].livePinId,
                            pin: Not(IsNull()),
                        },
                    });
                    let regenerateOrCreate: string;
                    if (pin?.pin) {
                        regenerateOrCreate = 'regenerate';
                    } else {
                        regenerateOrCreate = 'create';
                    }
                    await manager.save(updatedPins[i]); // this fires the trigger to create an audit log
                    // Update the log with the correct info
                    let log,
                        updateInfo = {};
                    if (regenerateOrCreate === 'create') {
                        log = await manager.findOneOrFail(PinAuditLog, {
                            order: {
                                logCreatedAt: 'DESC', // looking for most recent log
                            },
                            where: { livePinId: updatedPins[i].livePinId },
                        });
                        updateInfo = {
                            alteredByUsername: expireUsername,
                            alteredByName: expireName,
                            sentToEmail: sendToInfo.email,
                            sentToPhone: sendToInfo.phoneNumber,
                        };
                        logInfo = await manager.update(
                            PinAuditLog,
                            { logId: log.logId },
                            updateInfo,
                        );
                    } else {
                        log = await manager.find(PinAuditLog, {
                            order: {
                                logCreatedAt: 'DESC', // looking for most recent log first
                            },
                            where: { livePinId: updatedPins[i].livePinId },
                            take: 2,
                        });
                        if (log.length === 2) {
                            // put expiration on old pin
                            updateInfo = {
                                expirationReason: reason,
                                expiredAt: new Date(),
                            };
                            logInfo = await manager.update(
                                PinAuditLog,
                                { logId: log[1].logId },
                                updateInfo,
                            );
                            // put alteration info on the recreation
                            updateInfo = {
                                alteredByUsername: expireUsername,
                                alteredByName: expireName,
                                sentToEmail: sendToInfo.email,
                                sentToPhone: sendToInfo.phoneNumber,
                            };
                            logInfo = await manager.update(
                                PinAuditLog,
                                { logId: log[0].logId },
                                updateInfo,
                            );
                        } else {
                            // this case shouldn't happen, but in case something weird happens, just update the most recent log
                            updateInfo = {
                                alteredByUsername: expireUsername,
                                alteredByName: expireName,
                                sentToEmail: sendToInfo.email,
                                sentToPhone: sendToInfo.phoneNumber,
                            };
                            logInfo = await manager.update(
                                PinAuditLog,
                                { logId: log[0].logId },
                                updateInfo,
                            );
                        }
                    }
                    const gcNotifyBody = {
                        email: sendToInfo.email,
                        phoneNumber: sendToInfo.phoneNumber,
                        propertyAddress: propertyAddress,
                    };
                    regenerateOrCreate === 'create'
                        ? (emailTemplateId =
                              process.env
                                  .GC_NOTIFY_CREATE_EMAIL_TEMPLATE_ID!) &&
                          (phoneTemplateId =
                              process.env.GC_NOTIFY_CREATE_PHONE_TEMPLATE_ID!)
                        : (emailTemplateId =
                              process.env
                                  .GC_NOTIFY_REGENERATE_EMAIL_TEMPLATE_ID!) &&
                          (phoneTemplateId =
                              process.env
                                  .GC_NOTIFY_REGENERATE_PHONE_TEMPLATE_ID!);
                    const notificationResponse =
                        await sendCreateRegenerateOrExpireNotification(
                            gcNotifyBody,
                            emailTemplateId,
                            phoneTemplateId,
                            updatedPins[i],
                        );
                    if (notificationResponse) {
                        return [logInfo, regenerateOrCreate];
                    } else {
                        throw new Error(
                            `Error calling sendCreateRegenerateOrExpireNotification`,
                        );
                    }
                },
            )) as [logInfo: UpdateResult, regenerateOrCreate: string];
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
            typeof transactionReturn[0] != 'undefined' &&
            transactionReturn[0] &&
            transactionReturn[0].affected &&
            transactionReturn[0].affected !== 0
        ) {
            logger.debug(
                `Successfully updated ActivePIN with live_pin_id '${updatedPins[i].livePinId}'`,
            );
        } else {
            const message = `An error occured while updating updatedPins[${i}] in batchUpdatePin: No rows were affected by the update`;
            logger.warn(message);
            errors.push(message);
        }
    }
    return [errors, regenerateOrCreate];
}

/**
 * Single save pins that need an update, while also properly updating the logs
 * @param updatedPins The Array of pins with changes to save
 * @param sendToInfo The email and/or phone number of who the new pin should be sent to
 * @param requesterName The person requesting the (re)creation. Can be blank if it's the person themselves
 * @param requesterUsername The username of the person requesting the (re)creation. Can be blank if it's the person themselves
 * @returns An array of errors that occured / entries that were not processed, or an empty array upon total success.
 */
export async function singleUpdatePin(
    updatedPins: ActivePin,
    sendToInfo: emailPhone,
    propertyAddress: string,
    requesterUsername?: string,
    requesterName?: string,
): Promise<[string[], string]> {
    const errors = [];
    const regenerateOrCreate = '';
    let expireUsername: string,
        expireName: string,
        reason: expirationReason,
        logInfo: UpdateResult;
    if (!requesterUsername || !requesterName) {
        expireUsername = 'Self';
        expireName = 'Self Requested';
        reason = expirationReason.OnlineReset;
    } else {
        expireUsername = requesterUsername;
        expireName = requesterName;
        reason = expirationReason.CallCenterPinReset;
    }
    let emailTemplateId: string;
    let phoneTemplateId: string;
    let transactionReturn;
    try {
        transactionReturn = (await AppDataSource.transaction(
            async (manager) => {
                const pin = await manager.findOne(ActivePin, {
                    where: {
                        livePinId: updatedPins.livePinId,
                        pin: Not(IsNull()),
                    },
                });
                let regenerateOrCreate: string;
                if (pin?.pin) {
                    regenerateOrCreate = 'regenerate';
                } else {
                    regenerateOrCreate = 'create';
                }
                await manager.save(updatedPins); // this fires the trigger to create an audit log
                // Update the log with the correct info
                let log,
                    updateInfo = {};
                if (regenerateOrCreate === 'create') {
                    log = await manager.findOneOrFail(PinAuditLog, {
                        order: {
                            logCreatedAt: 'DESC', // looking for most recent log
                        },
                        where: { livePinId: updatedPins.livePinId },
                    });
                    updateInfo = {
                        alteredByUsername: expireUsername,
                        alteredByName: expireName,
                        sentToEmail: sendToInfo.email,
                        sentToPhone: sendToInfo.phoneNumber,
                    };
                    logInfo = await manager.update(
                        PinAuditLog,
                        { logId: log.logId },
                        updateInfo,
                    );
                } else {
                    log = await manager.find(PinAuditLog, {
                        order: {
                            logCreatedAt: 'DESC', // looking for most recent log first
                        },
                        where: { livePinId: updatedPins.livePinId },
                        take: 2,
                    });
                    if (log.length === 2) {
                        // put expiration on old pin
                        updateInfo = {
                            expirationReason: reason,
                            expiredAt: new Date(),
                        };
                        logInfo = await manager.update(
                            PinAuditLog,
                            { logId: log[1].logId },
                            updateInfo,
                        );
                        // put alteration info on the recreation
                        updateInfo = {
                            alteredByUsername: expireUsername,
                            alteredByName: expireName,
                            sentToEmail: sendToInfo.email,
                            sentToPhone: sendToInfo.phoneNumber,
                        };
                        logInfo = await manager.update(
                            PinAuditLog,
                            { logId: log[0].logId },
                            updateInfo,
                        );
                    } else {
                        // this case shouldn't happen, but in case something weird happens, just update the most recent log
                        updateInfo = {
                            alteredByUsername: expireUsername,
                            alteredByName: expireName,
                            sentToEmail: sendToInfo.email,
                            sentToPhone: sendToInfo.phoneNumber,
                        };
                        logInfo = await manager.update(
                            PinAuditLog,
                            { logId: log[0].logId },
                            updateInfo,
                        );
                    }
                }
                const gcNotifyBody = {
                    email: sendToInfo.email,
                    phoneNumber: sendToInfo.phoneNumber,
                    propertyAddress: propertyAddress,
                };
                regenerateOrCreate === 'create'
                    ? (emailTemplateId =
                          process.env.GC_NOTIFY_CREATE_EMAIL_TEMPLATE_ID!) &&
                      (phoneTemplateId =
                          process.env.GC_NOTIFY_CREATE_PHONE_TEMPLATE_ID!)
                    : (emailTemplateId =
                          process.env
                              .GC_NOTIFY_REGENERATE_EMAIL_TEMPLATE_ID!) &&
                      (phoneTemplateId =
                          process.env.GC_NOTIFY_REGENERATE_PHONE_TEMPLATE_ID!);
                const notificationResponse =
                    await sendCreateRegenerateOrExpireNotification(
                        gcNotifyBody,
                        emailTemplateId,
                        phoneTemplateId,
                        updatedPins,
                    );
                if (notificationResponse) {
                    return [logInfo, regenerateOrCreate];
                } else {
                    throw new Error(
                        `Error calling sendCreateRegenerateOrExpireNotification`,
                    );
                }
            },
        )) as [logInfo: UpdateResult, regenerateOrCreate: string];
    } catch (err) {
        if (err instanceof Error) {
            const message = `An error occured while updating updatedPin in singleUpdatePin: ${err.message}`;
            logger.warn(message);
            errors.push(message);
        }
    }

    if (
        typeof transactionReturn != 'undefined' &&
        typeof transactionReturn[0] != 'undefined' &&
        transactionReturn[0] &&
        transactionReturn[0].affected &&
        transactionReturn[0].affected !== 0
    ) {
        // logger.debug(
        //     `Successfully updated ActivePIN with live_pin_id '${updatedPins.livePinId}'`,
        // );
    } else {
        const message = `An error occured while updating updatedPin in singleUpdatePin: No rows were affected by the update`;
        logger.warn(message);
        errors.push(message);
    }
    return [errors, regenerateOrCreate];
}
