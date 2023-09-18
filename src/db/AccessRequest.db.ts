import { InsertResult } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AccessRequest } from '../entity/AccessRequest';
import logger from '../middleware/logger';
import { requestStatusType, accessRequestResponseBody } from '../helpers/types';

export async function createRequest(
    accessRequestInfo: accessRequestResponseBody,
): Promise<any | undefined> {
    const transactionReturn = (await AppDataSource.transaction(
        async (manager) => {
            const newRequest = await manager.create(AccessRequest, {
                userGuid: accessRequestInfo.userGuid,
                identityType: accessRequestInfo.identityType,
                requestRole: accessRequestInfo.requestRole,
                organization: accessRequestInfo.organization,
                email: accessRequestInfo.email,
                userName: accessRequestInfo.userName,
                firstName: accessRequestInfo.firstName,
                lastName: accessRequestInfo.lastName,
                requestReason: accessRequestInfo.requestReason,
                requestStatus: requestStatusType.NotGranted,
            });
            const createdRequest = await manager.insert(
                AccessRequest,
                newRequest,
            );
            // TODO integrate GC Notify
            return { createdRequest };
        },
    )) as { createdRequest: InsertResult };
    if (typeof transactionReturn.createdRequest != 'undefined') {
        if (
            transactionReturn.createdRequest.identifiers &&
            transactionReturn.createdRequest.identifiers !== null
        ) {
            logger.debug(
                `Successfully created a access request with id  '${transactionReturn.createdRequest.identifiers}'`,
            );
            return transactionReturn.createdRequest.identifiers;
        }
    }
}
