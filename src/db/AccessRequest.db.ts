// import { Query } from 'tsoa';
import { InsertResult, FindOptionsOrderValue } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AccessRequest } from '../entity/AccessRequest';
import logger from '../middleware/logger';
import { requestStatusType, accessRequestResponseBody } from '../helpers/types';

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

/* The `getRequestList` function is retrieving a list of access requests from the
database based on the provided status. It takes a `status` parameter of type
`requestStatusType` and returns a promise that resolves to an array of
`AccessRequest` entities or any value. */
export async function getRequestList(
    status: requestStatusType,
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
            firstName: true,
            lastName: true,
            requestReason: true,
            rejectionReason: true,
            createdAt: true,
        },
        where: {
            requestStatus: status,
        },
        order: { createdAt: 'ASC' as FindOptionsOrderValue },
    };

    const result = await repo.find(query);

    return result;
}
