import { InsertResult } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AccessRequest } from '../entity/AccessRequest';
import logger from '../middleware/logger';
import { requestStatusType, accessRequestResponseBody } from '../helpers/types';
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

            const templateId =
                process.env.GC_NOTIFY_ACCESS_REQUEST_EMAIL_TEMPLATE_ID;

            const personalisation = {
                given_name: newRequest.firstName,
                last_name: newRequest.lastName,
                role: newRequest.requestedRole,
                request_reason: newRequest.requestReason,
            };

            const emailAddresses: any[] = [];

            // All requests get emails to vhers_admin
            emailAddresses.push(process.env.GC_NOTIFY_VHERS_ADMIN_EMAIL);

            // All client support requests get email to individaul support staff and admins
            // TODO - What does this mean (certain requestType?)
            if (newRequest.requestedRole == 'Standard') {
                const emailString: string =
                    process.env.GC_NOTIFY_SUPPORT_STAFF_AND_ADMIN_EMAIL_LIST!;
                const emailArray = emailString.split(',');
                for (const emailAddress of emailArray) {
                    emailAddresses.push(emailAddress.trim());
                }
            }

            console.log(emailAddresses);

            for (const emailAddress of emailAddresses) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await gCNotifyCaller.sendEmailNotification(
                    templateId!,
                    emailAddress,
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
