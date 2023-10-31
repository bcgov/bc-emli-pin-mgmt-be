// import { Query } from 'tsoa';
import { InsertResult, FindOptionsOrderValue, UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AccessRequest } from '../entity/AccessRequest';
import logger from '../middleware/logger';
import {
    requestStatusType,
    accessRequestResponseBody,
    accessRequestUpdateRequestBody,
} from '../helpers/types';
import { findUser } from '../db/Users.db';
import GCNotifyCaller from '../helpers/GCNotifyCaller';

const gCNotifyCaller = new GCNotifyCaller();

export async function createRequest(
    accessRequestInfo: accessRequestResponseBody,
): Promise<any | undefined> {
    const params = {
        userGuid: accessRequestInfo.userGuid,
        identityType: accessRequestInfo.identityType,
        requestedRole: accessRequestInfo.requestedRole,
        organization: accessRequestInfo.organization,
        email: accessRequestInfo.email,
        userName: accessRequestInfo.userName,
        givenName: accessRequestInfo.givenName,
        lastName: accessRequestInfo.lastName,
        requestReason: accessRequestInfo.requestReason,
        requestStatus: requestStatusType.NotGranted,
    };
    const transactionReturn = (await AppDataSource.transaction(
        async (manager) => {
            const newRequest = await manager.create(AccessRequest, params);
            const createdRequest = await manager.insert(
                AccessRequest,
                newRequest,
            );

            let emailAddresses: any[] = [];

            // Admin requests go to vhers_admin email only
            if (accessRequestInfo.requestedRole === 'Admin') {
                emailAddresses = [
                    { email: process.env.GC_NOTIFY_VHERS_ADMIN_EMAIL! },
                ];
            }
            // Standard requests go to all admins, super-admins, vhers_admin
            else if (accessRequestInfo.requestedRole === 'Standard') {
                emailAddresses = await findUser({ email: true }, [
                    { role: 'Admin' },
                    { role: 'SuperAdmin' },
                ]);
                emailAddresses.push({
                    email: process.env.GC_NOTIFY_VHERS_ADMIN_EMAIL!,
                });
            }

            const templateId =
                process.env.GC_NOTIFY_ACCESS_REQUEST_EMAIL_TEMPLATE_ID;

            const personalisation = {
                given_name: accessRequestInfo.givenName,
                last_name: accessRequestInfo.lastName,
                role: accessRequestInfo.requestedRole,
                request_reason: accessRequestInfo.requestReason,
            };

            for (const emailAddress of emailAddresses) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await gCNotifyCaller.sendEmailNotification(
                    templateId!,
                    emailAddress.email,
                    personalisation,
                );
            }

            return { createdRequest };
        },
    )) as { createdRequest: InsertResult };
    if (typeof transactionReturn.createdRequest != 'undefined') {
        if (
            transactionReturn.createdRequest.identifiers &&
            transactionReturn.createdRequest.identifiers !== null
        ) {
            logger.debug(
                `Successfully created an access request with id  '${transactionReturn.createdRequest.identifiers}'`,
            );
            return transactionReturn.createdRequest.identifiers;
        }
    }
}

/* The `updateRequestStatus` function is updating the status of an access request
in the database. It takes a `responseBody` parameter of type
`accessRequestUpdateRequestBody`, which contains the updated status
information. The function then performs a transaction using the
`AppDataSource.transaction` method to ensure data consistency. Within the
transaction, it calls the `manager.update` method to update the
`AccessRequest` entity with the specified `requestId` and the new status
information. Finally, it returns the number of affected rows in the database. */
export async function updateRequestStatus(
    requestBody: accessRequestUpdateRequestBody,
): Promise<any | undefined> {
    const action = requestBody.action;
    const idList: any[] = [];
    let updateFields: any;
    let templateId: string;

    for (const itemId in requestBody?.requestIds) {
        const where = { requestId: requestBody?.requestIds[itemId] };
        idList.push(where);
    }
    if (action === requestStatusType.Granted) {
        updateFields = { requestStatus: requestStatusType.Granted };
        templateId = process.env.GC_NOTIFY_ACCESS_APPROVE_EMAIL_TEMPLATE_ID!;
    }

    if (action === requestStatusType.Rejected) {
        updateFields = {
            requestStatus: requestStatusType.Rejected,
            rejectionReason: requestBody.rejectionReason,
        };
        templateId = process.env.GC_NOTIFY_ACCESS_REJECT_EMAIL_TEMPLATE_ID!;
    }

    action;
    const transactionReturn = (await AppDataSource.transaction(
        async (manager) => {
            const updatedRequest = await manager.update(
                AccessRequest,
                idList,
                updateFields,
            );

            for (let i = 0; i < requestBody.emails.length; i++) {
                const email = requestBody.emails[i];
                const givenName = requestBody.givenNames[i];
                const lastName = requestBody.lastNames[i];
                const requestedRole = requestBody.requestedRoles[i];

                const personalisation = {
                    given_name: givenName,
                    last_name: lastName,
                    role: requestedRole,
                    reject_reason: requestBody.rejectionReason,
                };

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await gCNotifyCaller.sendEmailNotification(
                    templateId!,
                    email,
                    personalisation,
                );
            }

            return { updatedRequest };
        },
    )) as { updatedRequest: UpdateResult };
    if (typeof transactionReturn.updatedRequest != 'undefined') {
        if (
            transactionReturn.updatedRequest.affected &&
            transactionReturn.updatedRequest.affected !== null
        ) {
            logger.debug(
                `Successfully created an access request with id  '${transactionReturn.updatedRequest.affected}'`,
            );
            return transactionReturn.updatedRequest.affected;
        }
    }
}

/* The `getRequestList` function is retrieving a list of access requests from the
database based on the provided status. It takes a `status` parameter of type
`requestStatusType` and returns a promise that resolves to an array of
`AccessRequest` entities or any value. */
export async function getRequestList(
    where?: object,
): Promise<AccessRequest[] | any> {
    const repo = await AppDataSource.getRepository(AccessRequest);
    const query = {
        select: {
            requestId: true,
            userGuid: true,
            identityType: true,
            requestedRole: true,
            organization: true,
            email: true,
            userName: true,
            givenName: true,
            lastName: true,
            requestStatus: true,
            requestReason: true,
            rejectionReason: true,
            createdAt: true,
        },
        where: where ? where : undefined,
        order: { createdAt: 'ASC' as FindOptionsOrderValue },
    };

    let result;
    if (query.where === undefined) {
        result = await repo.find({ order: { createdAt: 'ASC' } });
    } else {
        result = await repo.find(query);
    }

    return result;
}
