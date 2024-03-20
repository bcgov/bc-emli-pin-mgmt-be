import { InsertResult, FindOptionsOrderValue, UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AccessRequest } from '../entity/AccessRequest';
import logger from '../middleware/logger';
import {
    requestStatusType,
    accessRequestResponseBody,
    accessRequestUpdateRequestBody,
} from '../helpers/types';
import {
    sendAccessApproveAndRejectNotifications,
    sendAccessRequestNotifications,
} from '../helpers/GCNotifyCalls';
import { NotFoundError } from '../helpers/NotFoundError';

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
    let transactionReturn;
    try {
        transactionReturn = (await AppDataSource.transaction(
            async (manager) => {
                const newRequest = await manager.create(AccessRequest, params);
                const createdRequest = await manager.insert(
                    AccessRequest,
                    newRequest,
                );
                const notificationResponse =
                    await sendAccessRequestNotifications(accessRequestInfo);
                if (notificationResponse) {
                    return { createdRequest };
                } else {
                    throw new Error(
                        `Error calling sendAccessRequestNotifications`,
                    );
                }
            },
        )) as { createdRequest: InsertResult };
    } catch (err) {
        if (err instanceof Error) {
            const message = `An error occured while calling createRequest: ${err.message}`;
            throw new Error(message);
        }
    }

    if (typeof transactionReturn?.createdRequest != 'undefined') {
        if (
            transactionReturn.createdRequest.identifiers &&
            transactionReturn.createdRequest.identifiers !== null
        ) {
            logger.debug(
                `Successfully created an access request with id '${transactionReturn.createdRequest.identifiers[0].requestId}'`,
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
    username: string,
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
            updatedBy: username,
            requestStatus: requestStatusType.Rejected,
            rejectionReason: requestBody.rejectionReason,
        };
        templateId = process.env.GC_NOTIFY_ACCESS_REJECT_EMAIL_TEMPLATE_ID!;
    }

    let transactionReturn;
    try {
        transactionReturn = (await AppDataSource.transaction(
            async (manager) => {
                const updatedRequest = await manager.update(
                    AccessRequest,
                    idList,
                    updateFields,
                );
                if (!updatedRequest.affected || updatedRequest.affected === 0) {
                    throw new NotFoundError(
                        'Request to update not found in database',
                    );
                }
                const notificationResponse =
                    await sendAccessApproveAndRejectNotifications(
                        requestBody,
                        templateId,
                    );
                if (notificationResponse) {
                    return { updatedRequest };
                } else {
                    throw new Error(
                        `Error calling sendAccessApproveAndRejectNotifications`,
                    );
                }
            },
        )) as { updatedRequest: UpdateResult };
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw err;
        }
        if (err instanceof Error) {
            const message = `An error occured while calling updateRequestStatus: ${err.message}`;
            throw new Error(message);
        }
    }

    if (typeof transactionReturn?.updatedRequest != 'undefined') {
        if (
            transactionReturn.updatedRequest.affected &&
            transactionReturn.updatedRequest.affected !== 0
        ) {
            logger.debug(
                `Successfully updated ${transactionReturn.updatedRequest.affected} request(s)`,
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
            updatedBy: true,
            updatedAt: true,
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
