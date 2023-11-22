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
    noPendingRequestFound,
    DuplicateRequestErrorType,
    InvalidTokenErrorResponse,
    UnauthorizedErrorResponse,
    verifyPinResponse,
    requestListQueryParam,
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
import { NotFoundError } from '../helpers/NotFoundError';

@Middlewares(authenticate)
@Route('user-requests')
export class AccessRequestController extends Controller {
    @SuccessResponse('201', 'Created')
    @Post('')
    /**
     * Create a new access request for a user
     */
    public async createAccessRequest(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
        @Res() _notFoundErrorResponse: TsoaResponse<404, verifyPinResponse>,
        @Res()
        duplicateErrorResponse: TsoaResponse<409, DuplicateRequestErrorType>,
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

        if (requestBody.requestReason === '') {
            const message = 'Must provide a reason for requested user.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        try {
            const request = await getRequestList({
                userGuid: requestBody.userGuid,
                requestStatus: requestStatusType.NotGranted,
            });
            if (request.length > 0) {
                // there is already a request that has not yet been granted
                const message = `There already exists an access request for this user: ${requestBody.userName}. Please contact your administrator.`;
                logger.warn(message);
                return duplicateErrorResponse(409, { message });
            }
            await createRequest(requestBody);
        } catch (err) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error for user:${requestBody.userName} in createAccessRequest: ${err.message}`,
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
     * @param status Status of the requests
     * @returns A list of request of a status
     */

    @Get('')
    public async getAllRequests(
        @Res() _unauthorizedErrorResponse: TsoaResponse<401, unauthorizedError>,
        @Res() _badRequestErrorResponse: TsoaResponse<400, badRequestError>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        noPendingRequestFoundResponse: TsoaResponse<204, noPendingRequestFound>,
        @Query() status: requestListQueryParam,
        @Request() req: req,
    ): Promise<Array<accessRequestList>> {
        let results: Array<accessRequestList> = [];
        let permissions: string[] = [];
        let payload = { permissions: [], username: '' };
        // validate access
        try {
            payload = decodingJWT(req.cookies.token)?.payload;
            permissions = payload.permissions;
            if (!permissions.includes('ACCESS_REQUEST')) {
                throw new AuthenticationError(
                    `Permission 'ACCESS_REQUEST' is not available for the user '${payload.username}'`,
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
            if (status === requestListQueryParam.pending) {
                where = { requestStatus: requestStatusType.NotGranted };
            } else if (status === requestListQueryParam.completed) {
                where = [
                    { requestStatus: requestStatusType.Granted },
                    { requestStatus: requestStatusType.Rejected },
                ];
            }
            const requestList = await getRequestList(where);
            if (requestList[0] === undefined) {
                logger.warn(`Encountered a 204 message in getAllRequests.`);
                return noPendingRequestFoundResponse(204, {}); // 204 must return an empty body
            }
            results = requestList;
        } catch (err) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORMError in getAuditLogs: ${err.message}`,
                );
                return typeORMErrorResponse(422, {
                    message: err.message,
                } as GenericTypeORMErrorType);
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered 500 unknown Internal Server Error in getAllRequests: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return results;
    }

    @SuccessResponse('204', 'No content')
    @Put('')
    /**
     * Update access request for a user
     */
    public async updateAccessRequest(
        @Res()
        _invalidTokenErrorResponse: TsoaResponse<
            400,
            InvalidTokenErrorResponse
        >,
        @Res()
        _unauthorizedErrorResponse: TsoaResponse<
            401,
            UnauthorizedErrorResponse
        >,
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
        let payload = { permissions: [], username: '' };
        // validate access
        try {
            payload = decodingJWT(req.cookies.token)?.payload;
            permissions = payload.permissions;
            if (!permissions.includes('ACCESS_REQUEST')) {
                throw new AuthenticationError(
                    `Permission 'ACCESS_REQUEST' is not available for the user '${payload.username}'`,
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
            (requestBody.rejectionReason === '' ||
                requestBody.rejectionReason === undefined)
        ) {
            const message = 'Must provide reason for rejection.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        if (requestBody.requestIds.length < 1) {
            const message = 'Must provide at least 1 request id.';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        try {
            await updateRequestStatus(requestBody, payload.username);
        } catch (err) {
            if (err instanceof NotFoundError) {
                logger.warn(
                    `Encountered Not Found Error in updateAccessRequest: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: 404,
                });
            }
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error in updateAccessRequest: ${err.message}`,
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
