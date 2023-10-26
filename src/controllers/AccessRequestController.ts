import {
    Post,
    Route,
    Controller,
    TsoaResponse,
    Res,
    Body,
    SuccessResponse,
    Middlewares,
} from 'tsoa';
import {
    serverErrorType,
    GenericTypeORMErrorType,
    requiredFieldErrorType,
    accessRequestResponseBody,
} from '../helpers/types';

import logger from '../middleware/logger';
import { createRequest } from '../db/AccessRequest.db';
import { TypeORMError } from 'typeorm';
import { authenticate } from '../middleware/authentication';
import GCNotifyCaller from '../helpers/GCNotifyCaller';
import { findUser } from '../db/Users.db';

const gCNotifyCaller = new GCNotifyCaller();

@Middlewares(authenticate)
@Route('user-requests')
export class AccessRequestController extends Controller {
    @SuccessResponse('201', 'Created')
    @Post('')
    /**
     * Create a new access request for a user
     */
    public async createAccessRequest(
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Body() requestBody: accessRequestResponseBody,
    ): Promise<void> {
        this.setStatus(201);
        // validate inputs
        if (
            requestBody.identityType === 'idir' &&
            requestBody.organization === ''
        ) {
            const message = 'Must provide an organization.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }

        if (requestBody.requestedRole === null) {
            const message = 'Must provide an role for requested user.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }

        if (requestBody.requestReason === '') {
            const message = 'Must provide an reason for requested user.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        try {
            await createRequest(requestBody);
            let emailAddresses: any[] = [];

            // Admin requests go to vhers_admin email only
            if (requestBody.requestedRole === 'Admin') {
                emailAddresses = [
                    { email: process.env.GC_NOTIFY_VHERS_ADMIN_EMAIL! },
                ];
            }
            // Standard requests go to all admins, super-admins, vhers_admin
            else if (requestBody.requestedRole === 'Standard') {
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
                given_name: requestBody.givenName,
                last_name: requestBody.lastName,
                role: requestBody.requestedRole,
                request_reason: requestBody.requestReason,
            };

            for (const emailAddress of emailAddresses) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const response = await gCNotifyCaller.sendEmailNotification(
                    templateId!,
                    emailAddress.email,
                    personalisation,
                );
            }
        } catch (err) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error in createAccessRequest: ${err.message}`,
                );
                return typeORMErrorResponse(422, { message: err.message });
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in creating access request: ${err}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }

        return;
    }
}
