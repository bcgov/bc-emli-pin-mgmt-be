import { noPendingRequestFound } from './../helpers/types';
import {
    Get,
    Post,
    Put,
    Request,
    Query,
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
    badRequestError,
    forbiddenError,
    unauthorizedError,
    notFoundError,
    accessRequestList,
    requestStatusType,
    accessRequestUpdateRequestBody,
} from '../helpers/types';
import { decodingJWT } from '../helpers/auth';
import { Request as req } from 'express';
import logger from '../middleware/logger';
import {
    createRequest,
    getRequestList,
    updateRequestStatus,
} from '../db/AccessRequest.db';
import { TypeORMError } from 'typeorm';
import { authenticate } from '../middleware/authentication';
import { AuthenticationError } from '../middleware/AuthenticationError';
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

    /*
     * Use to get access request list for a give status
     * Expected error codes and messages:
     * - 200
     * -- 'OK'
     * - 204
     *  -- 'No Content'
     * - 400
     *  -- 'Bad Request'
     * - 401
     * -- 'Unauthorized'
     * - 403
     * -- 'Forbidden'
     * - 404
     * -- 'Not Found'
     * @param status The siteID of a site
     * @returns A list of request of a status
     */

    @Get('')
    public async getAllRequests(
        @Res() unauthorizedErrorResponse: TsoaResponse<401, unauthorizedError>,
        @Res() badRequestErrorResponse: TsoaResponse<400, badRequestError>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        noPendingRequestFoundResponse: TsoaResponse<204, noPendingRequestFound>,
        @Query() status: string,
        @Request() req: req,
    ): Promise<Array<accessRequestList>> {
        let results: Array<accessRequestList> = [];
        let permissions: string[] = [];
        // checking permissions for this api.
        try {
            permissions = decodingJWT(req.cookies.token)?.payload.permissions;
            if (!permissions.includes('ACCESS_REQUEST')) {
                throw new AuthenticationError(
                    `Permission 'ACCESS_REQUEST' is not available for this user`,
                    403,
                );
            }
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered 403 forbidden error in getAllRequests: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
            if (err instanceof Error) {
                logger.warn(
                    `Encountered 404 not found error in getAllRequests: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: 404,
                });
            }
        }
        // retrieving data for a particular status
        try {
            let where;
            if (status === 'pending') {
                where = { requestStatus: requestStatusType.NotGranted };
            } else if (status === 'completed') {
                where = [
                    { requestStatus: requestStatusType.Granted },
                    { requestStatus: requestStatusType.Rejected },
                ];
            }
            const requestList = await getRequestList(where);
            if (requestList[0] === undefined) {
                logger.warn(`Encountered a 204 message in getAllRequests.`);
                /* const exception: notFoundError = {
                    message: `Encountered a 204 message in getAllRequests. No ${status} request exists in the database`,
                    code: 204,
                };
                throw exception; */

                return noPendingRequestFoundResponse(204, {
                    message: `Encountered a 204 message in getAllRequests. No ${status} request exists in the database`,
                    code: 204,
                });
            }
            results = requestList;
        } catch (err: any) {
            if (err.code === 401) {
                logger.warn(
                    `Encountered 401 unauthorized error in getAllRequests: ${err.message}`,
                );
                return unauthorizedErrorResponse(401, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 400) {
                logger.warn(
                    `Encountered 400 bad request error in getAllRequests: ${err.message}`,
                );
                return badRequestErrorResponse(400, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 403) {
                logger.warn(
                    `Encountered 403 forbidden error in getAllRequests: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 404) {
                logger.warn(
                    `Encountered 404 not found error in getAllRequests: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: err.code,
                });
            } else {
                logger.warn(
                    `Encountered 500 unknown Internal Server Error in getAllRequests: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        // Sort results
        // results = this.sortDetailsResults(results);
        return results;
    }

    @SuccessResponse('204', 'No content')
    @Put('')
    /**
     * Create a new access request for a user
     */
    public async updateAccessRequest(
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Body() requestBody: accessRequestUpdateRequestBody,
        @Request() req: req,
    ): Promise<void> {
        this.setStatus(204);
        let permissions: string[] = [];

        // validate access
        try {
            permissions = decodingJWT(req.cookies.token)?.payload.permissions;
            if (!permissions.includes('ACCESS_REQUEST')) {
                throw new AuthenticationError(
                    `Permission 'ACCESS_REQUEST' is not available for this user`,
                    403,
                );
            }
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered 403 forbidden error in getAllRequests: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
            if (err instanceof Error) {
                logger.warn(
                    `Encountered 404 not found error in getAllRequests: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: 404,
                });
            }
        }
        // validate inputs
        if (
            requestBody.action === requestStatusType.Rejected &&
            requestBody.rejectionReason === ''
        ) {
            const message = 'Must provide reason for rejection.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }

        if (requestBody.action === null || requestBody.action === undefined) {
            const message = 'Must provide an action for update.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }

        if (requestBody.requestIds.length < 1) {
            const message = 'Must provide at least of request id';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        try {
            await updateRequestStatus(requestBody);
            // TODO: add send email functionality
            /* let emailAddresses: any[] = [];
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
            }*/
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
