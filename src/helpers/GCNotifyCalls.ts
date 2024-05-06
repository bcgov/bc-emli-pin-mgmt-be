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
export function standardizeRole(role: string) {
    let formattedRole: string = '';

    if (role.toLowerCase() === 'Admin'.toLowerCase()) {
        formattedRole = 'Supervisor';
    } else if (role.toLowerCase() === 'SuperAdmin'.toLowerCase()) {
        formattedRole = 'System administrator';
    } else if (role.toLowerCase() === 'Standard'.toLowerCase()) {
        formattedRole = 'Customer support agent';
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
            const result = await findUser({ email: true }, [
                { role: 'Admin', isActive: true },
                { role: 'SuperAdmin', isActive: true },
            ]);
            // removing dupilcate emails
            const map = new Map();
            for (const item of result) {
                if (!map.has(item.email)) {
                    map.set(item.email, true);
                    emailAddresses.push({
                        email: item.email,
                    });
                }
            }
            emailAddresses.push({
                email: process.env.GC_NOTIFY_VHERS_ADMIN_EMAIL!,
            });
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
        if (err instanceof Error) {
            const message = `Encountered ${err.name} calling sendAccessRequestNotifications: ${err.message}`;
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
        for (let i = 0; i < Math.min(requestBody.emails.length, 1000); i++) {
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
        for (let i = 0; i < Math.min(requestBody.emails.length, 1000); i++) {
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

/**
 * Send GC Notify email notification upon PIN expiration.
 * @param requestBody contains email, phone, propertyAddress for GC Notify call
 * @param emailTemplateId GC Notify email template ID
 * @param phoneTemplateId GC Notify phone template ID
 * @returns true: Boolean - if function runs without errors
 */
export async function sendCreateRegenerateOrExpireNotification(
    requestBody: any,
    emailTemplateId: string,
    phoneTemplateId: string,
    PINToDelete: any,
) {
    try {
        const personalisation: any = {
            property_address: requestBody.propertyAddress,
        };
        if (PINToDelete.pin) {
            personalisation.pin = PINToDelete.pin;
        } else {
            personalisation.pin = ' '; // so we won't get an error sending an email with no pin
        }
        if (requestBody.email && !requestBody.phoneNumber) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const gcNotifyEmailResponse =
                await gCNotifyCaller.sendEmailNotification(
                    emailTemplateId!,
                    requestBody.email,
                    personalisation,
                );
        } else if (requestBody.phoneNumber && !requestBody.email) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const gcNotifyPhoneResponse =
                await gCNotifyCaller.sendPhoneNotification(
                    phoneTemplateId!,
                    requestBody.phoneNumber,
                    personalisation,
                );
        } else if (requestBody.phoneNumber && requestBody.email) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const gcNotifyEmailAndPhoneResponse =
                await gCNotifyCaller.sendEmailAndPhoneNotification(
                    emailTemplateId!,
                    phoneTemplateId!,
                    requestBody.email,
                    requestBody.phoneNumber,
                    personalisation,
                );

            if (!gcNotifyEmailAndPhoneResponse) {
                throw new Error(
                    'Failed to send email and phone GC Notify Notification.',
                );
            }
        }
        return true;
    } catch (err: any) {
        if (err instanceof Error) {
            const message = `Encountered ${err.name} calling sendCreateRegenerateOrExpireNotification: ${err.message}`;
            logger.warn(message);
            throw new Error(message);
        }
    }
}
