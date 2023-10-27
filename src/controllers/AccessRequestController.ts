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

    /**
     * Used to get access request list for a give status
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
     * @param siteID The siteID of a site
     * @returns An object containing the property owner details
     */

    /* @Get('')
    public async getAccessRequests(
        @Res() unauthorizedErrorResponse: TsoaResponse<401, unauthorizedError>,
        @Res() badRequestErrorResponse: TsoaResponse<400, badRequestError>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Query() pending: boolean,
    ): Promise<Array<accessRequestLists>> {
        let results: Array<accessRequestLists> = [];
        try {
            const parcelsApiUrl = `${process.env.GEOCODER_API_BASE_URL}${process.env.GEOCODER_API_PARCELS_ENDPOINT}`;
            const jsonFormat = '.json';
            const getPIDs = async () => {
                try {
                    return await axios.get(
                        `${parcelsApiUrl}${siteID}${jsonFormat}`,
                        {
                            headers: {
                                apikey: `${process.env.BCGEOCODER_API_KEY_PID}`,
                            },
                        },
                    );
                } catch (err: any) {
                    if (err.response.status === 401) {
                        const error: unauthorizedError = {
                            message: 'unauthorized error',
                            code: 401,
                        };
                        throw error;
                    } else if (err.response.status === 400) {
                        const error: badRequestError = {
                            message: 'bad request error',
                            code: 400,
                        };
                        throw error;
                    } else if (err.response.status === 403) {
                        const error: forbiddenError = {
                            message: 'forbidden error',
                            code: 403,
                        };
                        throw error;
                    } else if (err.response.status === 404) {
                        const error: notFoundError = {
                            message: 'not found error',
                            code: 404,
                        };
                        throw error;
                    }
                }
            };

            const pidsData: any = await getPIDs();
            const pids = pidStringSplitAndSort(pidsData.data.pids);
            const result = await findPropertyDetails(pids, role);
            if (result[0] === undefined) {
                logger.warn(
                    `Encountered a 204 message in getPropertyDetails. The retrieved pid(s) do(es) not exist in the database.`,
                );
                const exception: pidNotFound = {
                    message: `Encountered a 204 message in getPropertyDetails. The following pid(s) do(es) not exist in the database: ${pids}`,
                    code: 204,
                };
                throw exception;
            }
            results = result;
        } catch (err: any) {
            if (err.code === 401) {
                logger.warn(
                    `Encountered 401 unauthorized error in getPropertyDetails: ${err.message}`,
                );
                return unauthorizedErrorResponse(401, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 400) {
                logger.warn(
                    `Encountered 400 bad request error in getPropertyDetails: ${err.message}`,
                );
                return badRequestErrorResponse(400, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 403) {
                logger.warn(
                    `Encountered 403 forbidden error in getPropertyDetails: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 404) {
                logger.warn(
                    `Encountered 404 not found error in getPropertyDetails: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: err.code,
                });
            }  else {
                logger.warn(
                    `Encountered 500 unknown Internal Server Error in getPropertyDetails: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        // Sort results
        // results = this.sortDetailsResults(results);
        return results;
    }*/
}
