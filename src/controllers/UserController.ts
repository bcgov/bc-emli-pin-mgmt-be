import {
    Get,
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
    badRequestError,
    forbiddenError,
    unauthorizedError,
    notFoundError,
    userList,
    noActiveUserFound,
    userDeactivateRequestBody,
    userListQueryParam,
    userUpdateRequestBody,
} from '../helpers/types';
import { decodingJWT } from '../helpers/auth';
import { Request as req } from 'express';
import logger from '../middleware/logger';
import {
    getUserList,
    deactivateUsers,
    updateUser,
    findUser,
} from '../db/Users.db';
import { TypeORMError } from 'typeorm';
import { authenticate } from '../middleware/authentication';
import { AuthenticationError } from '../middleware/AuthenticationError';
import { NotFoundError } from '../helpers/NotFoundError';

@Middlewares(authenticate)
@Route('users')
export class UserController extends Controller {
    /*
     * Use to get user list based on status
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
     * - 422
     * -- 'Type ORM Error'
     * - 500
     * -- 'Internal Server Error
     * @param active Status of the user
     * @returns A list of users based on active status
     */

    @Get('')
    public async getAllUsers(
        @Res() _unauthorizedErrorResponse: TsoaResponse<401, unauthorizedError>,
        @Res() _badRequestErrorResponse: TsoaResponse<400, badRequestError>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        noActiveFoundResponse: TsoaResponse<204, noActiveUserFound>,
        @Query() active: userListQueryParam,
        @Request() req: req,
    ): Promise<Array<userList>> {
        let results: Array<userList> = [];
        let permissions: string[] = [];
        let payload = { username: '', permissions: [] };
        // checking permissions for this api.
        try {
            payload = decodingJWT(req.cookies.token)?.payload;
            permissions = payload.permissions;
            if (!permissions.includes('USER_ACCESS')) {
                throw new AuthenticationError(
                    `Permission 'USER_ACCESS' is not available for the user ${payload.username}`,
                    403,
                );
            }
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered 403 forbidden error in getAllUsers: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
            if (err instanceof Error) {
                logger.warn(
                    `Encountered 404 not found error in getAllUsers: ${err.message}`,
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
            let userStatus;
            if (active === userListQueryParam.active) {
                where = { isActive: true };
                userStatus = 'active';
            } else if (active === userListQueryParam.deactivate) {
                where = { isActive: false };
                userStatus = 'deactivated';
            }
            const userList = await getUserList(where);
            if (userList[0] === undefined) {
                logger.warn(`Encountered a 204 message in getAllUsers.`);
                return noActiveFoundResponse(204, {
                    message: `Encountered a 204 message in getAllUsers. No ${userStatus} user exists in the database`,
                    code: 204,
                });
            }
            results = userList;
        } catch (err) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORMError in getAllUsers: ${err.message}`,
                );
                return typeORMErrorResponse(422, {
                    message: err.message,
                } as GenericTypeORMErrorType);
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered 500 unknown Internal Server Error in getAllUsers: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return results;
    }

    @SuccessResponse('204', 'No content')
    @Put('')
    /**
     * Update user property
     */
    public async updateUser(
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Body() requestBody: userUpdateRequestBody,
        @Request() req: req,
    ): Promise<void> {
        this.setStatus(204);
        let permissions: string[] = [];

        // validate access
        try {
            const userInfo = decodingJWT(req.cookies.token)?.payload;
            permissions = userInfo?.permissions;
            if (!permissions.includes('USER_ACCESS')) {
                throw new AuthenticationError(
                    `Permission 'USER_ACCESS' is not available for the user ${userInfo?.username}`,
                    403,
                );
            }
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered 403 forbidden error in updateUser: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
            if (err instanceof Error) {
                logger.warn(
                    `Encountered 404 not found error in updateUser: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: 404,
                });
            }
        }
        // validate inputs
        try {
            const userId = { userId: requestBody.userId };
            const existingUser = await findUser({}, userId);
            if (existingUser.length < 1) {
                throw new TypeORMError(
                    `User with userId ${requestBody.userId} not found in database`,
                );
            }
            const updateFields = {
                ...(existingUser[0].role !== requestBody.role && {
                    role: requestBody.role,
                }),
                ...(existingUser[0].organization !==
                    requestBody.organization && {
                    organization: requestBody.organization,
                }),
                ...(existingUser[0].email !== requestBody.email && {
                    email: requestBody.email,
                }),
                ...(existingUser[0].userName !== requestBody.userName && {
                    userName: requestBody.userName,
                }),
                ...(existingUser[0].givenName !== requestBody.givenName && {
                    givenName: requestBody.givenName,
                }),
                ...(existingUser[0].lastName !== requestBody.lastName && {
                    lastName: requestBody.lastName,
                }),
            };
            await updateUser(userId, updateFields, requestBody);
        } catch (err) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error in update user: ${err.message} for ${requestBody.userId}:${requestBody.userName}`,
                );
                return typeORMErrorResponse(422, { message: err.message });
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in updating user data: ${err}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return;
    }

    @SuccessResponse('204', 'No content')
    @Put('deactivate')
    /**
     * Deactivate user(s)
     */
    public async deactivateUsers(
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res()
        requiredFieldErrorResponse: TsoaResponse<422, requiredFieldErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Body() requestBody: userDeactivateRequestBody,
        @Request() req: req,
    ): Promise<void> {
        this.setStatus(204);
        let permissions: string[] = [];
        let payload = { permissions: [], username: '' };

        // validate access
        try {
            payload = decodingJWT(req.cookies.token)?.payload;
            permissions = payload.permissions;
            if (!permissions.includes('USER_ACCESS')) {
                throw new AuthenticationError(
                    `Permission 'USER_ACCESS' is not available for the user ${payload.username}`,
                    403,
                );
            }
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered 403 forbidden error in updateUser: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
            if (err instanceof Error) {
                logger.warn(
                    `Encountered 404 not found error in updateUser: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: 404,
                });
            }
        }
        // validate inputs

        if (requestBody.userIds.length < 1) {
            const message = 'Must provide at least one user id';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        try {
            await deactivateUsers(requestBody, payload.username);
        } catch (err) {
            if (err instanceof NotFoundError) {
                logger.warn(
                    `Encountered Not Found Error in deactivateUsers: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: 404,
                });
            }
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error in deactivateUsers: ${err.message}`,
                );
                return typeORMErrorResponse(422, { message: err.message });
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in deactivating user(s): ${err}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return;
    }
}
