// eslint-disable-next-line @typescript-eslint/no-var-requires
import {
    accessRequestResponseBody,
    accessRequestUpdateRequestBody,
} from './types';
import { findUser } from '../db/Users.db';
import GCNotifyCaller from '../helpers/GCNotifyCaller';
import logger from '../middleware/logger';

const gCNotifyCaller = new GCNotifyCaller();

/**
 * Send GC Notify email notification upon access request.
 * @param accessRequestInfo contains requestedRole, givenName, lastName, and requestReason
 * @returns true
 */
export async function sendAccessRequestNotifications(
    accessRequestInfo: accessRequestResponseBody,
) {
    try {
        let emailAddresses: any[] = [];

        // Admin requests go to vhers_admin email only
        if (accessRequestInfo.requestedRole === 'Admin') {
            emailAddresses = [
                { email: process.env.GC_NOTIFY_VHERS_ADMIN_EMAIL! },
            ];
        }
        // Standard requests go to all admins, super-admins, vhers_admin
        else if (accessRequestInfo.requestedRole === 'Standard') {
            emailAddresses.push({
                email: process.env.GC_NOTIFY_VHERS_ADMIN_EMAIL!,
            });
            emailAddresses = await findUser({ email: true }, [
                { role: 'Admin' },
                { role: 'SuperAdmin' },
            ]);
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

        return true;
    } catch (err: any) {
        if (err.code) {
            const message = `Encountered ${err.code} error calling sendAccessRequestNotifications: ${err.message}`;
            logger.warn(message);
            throw new Error(message);
        }
    }
}

/**
 * Send GC Notify email notification upon status change on access request.
 * @param requestBody contains emails, requestedRoles, givenNames, lastNames, and rejectReason
 * @param accessRequestInfo contains requestedRole, givenName, lastName, and requestReason
 * @returns null
 */
export async function sendAccessApproveAndRejectNotifications(
    requestBody: accessRequestUpdateRequestBody,
    templateId: string,
) {
    try {
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

        return true;
    } catch (err: any) {
        const message = `Encountered error calling sendAccessRequestNotifications: ${err.message}`;
        logger.warn(message);
    }
}
