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

@Middlewares(authenticate)
@Route('user-requests')
export class AccessRequestController extends Controller {
    @SuccessResponse('201', 'Created')
    @Post('')
    /**
     * Create a new access request for a user
     * @param {accessRequestResponseBody} requestBody
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
