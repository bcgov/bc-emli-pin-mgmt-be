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
     * @param active Status of the user
     * @returns A list of users based on active status
     */

    @Get('')
    public async getAllUsers(
        @Res() unauthorizedErrorResponse: TsoaResponse<401, unauthorizedError>,
        @Res() badRequestErrorResponse: TsoaResponse<400, badRequestError>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res()
        noActiveFoundResponse: TsoaResponse<204, noActiveUserFound>,
        @Query() active: userListQueryParam,
        @Request() req: req,
    ): Promise<Array<userList>> {
        let results: Array<userList> = [];
        let permissions: string[] = [];
        // checking permissions for this api.
        try {
            permissions = decodingJWT(req.cookies.token)?.payload.permissions;
            if (!permissions.includes('USER_ACCESS')) {
                throw new AuthenticationError(
                    `Permission 'USER_ACCESS' is not available for this user`,
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
        } catch (err: any) {
            if (err.code === 401) {
                logger.warn(
                    `Encountered 401 unauthorized error in getAllUsers: ${err.message}`,
                );
                return unauthorizedErrorResponse(401, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 400) {
                logger.warn(
                    `Encountered 400 bad request error in getAllUsers: ${err.message}`,
                );
                return badRequestErrorResponse(400, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 403) {
                logger.warn(
                    `Encountered 403 forbidden error in getAllUsers: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: err.code,
                });
            } else if (err.code === 404) {
                logger.warn(
                    `Encountered 404 not found error in getAllUsers: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: err.code,
                });
            } else {
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
            permissions = decodingJWT(req.cookies.token)?.payload.permissions;
            if (!permissions.includes('USER_ACCESS')) {
                throw new AuthenticationError(
                    `Permission 'USER_ACCESS' is not available for this user`,
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
        console.log('---------------------------------');
        try {
            const userId = { userId: requestBody.userId };
            const existingUser = await findUser({}, userId);
            console.log(existingUser[0], '-----', requestBody);
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
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~', updateFields);
            const result = await updateUser(userId, updateFields);
            console.log('iiii------iiii', result);
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
          }  */
        } catch (err) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error in update user: ${err.message}`,
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

        // validate access
        try {
            permissions = decodingJWT(req.cookies.token)?.payload.permissions;
            if (!permissions.includes('USER_ACCESS')) {
                throw new AuthenticationError(
                    `Permission 'USER_ACCESS' is not available for this user`,
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

        if (
            requestBody.deactivationReason === null ||
            requestBody.deactivationReason === undefined
        ) {
            const message = 'Must provide deactivation reason for user(s).';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }

        if (requestBody.userIds.length < 1) {
            const message = 'Must provide at least of user id';
            logger.warn(message);
            return requiredFieldErrorResponse(422, { message });
        }
        try {
            await deactivateUsers(requestBody);
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
          }  */
        } catch (err) {
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
