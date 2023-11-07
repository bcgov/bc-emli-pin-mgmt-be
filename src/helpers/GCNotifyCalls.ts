// eslint-disable-next-line @typescript-eslint/no-var-requires
import {
    accessRequestResponseBody,
    accessRequestUpdateRequestBody,
    userDeactivateRequestBody,
    userUpdateRequestBody,
} from './types';
import { findUser } from '../db/Users.db';
import GCNotifyCaller from '../helpers/GCNotifyCaller';
import logger from '../middleware/logger';

const gCNotifyCaller = new GCNotifyCaller();

/**
 * Convert role into consistent string
 * @param role sting
 * @returns formattedRole: string
 */
function standardizeRole(role: string) {
    let formattedRole: string = '';

    if (role === 'Admin') {
        formattedRole = 'Administrator';
    } else if (role === 'SuperAdmin') {
        formattedRole = 'System administrator';
    } else if (role === 'Standard') {
        formattedRole = 'Client support';
    }

    return formattedRole;
}

/**
 * Send GC Notify email notification upon access request.
 * @param accessRequestInfo contains requestedRole, givenName, lastName, and requestReason
 * @returns true: Boolean - if function runs without errors
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

        const role: string = standardizeRole(accessRequestInfo.requestedRole);

        const personalisation = {
            given_name: accessRequestInfo.givenName,
            last_name: accessRequestInfo.lastName,
            role: role,
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
 * @param templateId GC Notify email template ID
 * @returns true: Boolean - if function runs without errors
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
            const requestedRole: string = standardizeRole(
                requestBody.requestedRoles[i],
            );

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

/**
 * Send GC Notify email notification upon deactivating user.
 * @param requestBody contains emails, givenNames, lastNames, and deactivationReason
 * @param templateId GC Notify email template ID
 * @returns true: Boolean - if function runs without errors
 */
export async function sendDeactiveUserNotifications(
    requestBody: userDeactivateRequestBody,
    templateId: string,
) {
    try {
        for (let i = 0; i < requestBody.emails.length; i++) {
            const email = requestBody.emails[i];
            const givenName = requestBody.givenNames[i];
            const lastName = requestBody.lastNames[i];

            const personalisation = {
                given_name: givenName,
                last_name: lastName,
                deactivation_reason: requestBody.deactivationReason,
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
        const message = `Encountered error calling sendDeactiveUserNotifications: ${err.message}`;
        logger.warn(message);
    }
}

/**
 * Send GC Notify email notification upon updating user role.
 * @param requestBody contains email, givenName, lastName, and role
 * @param templateId GC Notify email template ID
 * @returns true: Boolean - if function runs without errors
 */
export async function sendUpdateUserNotifications(
    requestBody: userUpdateRequestBody,
    templateId: string,
) {
    try {
        const role: string = standardizeRole(requestBody.role);

        const personalisation = {
            given_name: requestBody.givenName,
            last_name: requestBody.lastName,
            new_role: role,
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await gCNotifyCaller.sendEmailNotification(
            templateId!,
            requestBody.email,
            personalisation,
        );

        return true;
    } catch (err: any) {
        const message = `Encountered error calling sendUpdateUserNotifications: ${err.message}`;
        logger.warn(message);
    }
}
