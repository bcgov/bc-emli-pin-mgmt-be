import { Get, Res, Route, TsoaResponse, Request, Middlewares } from 'tsoa';
import { Request as req } from 'express';
import { sign } from 'jsonwebtoken';
import {
    InvalidTokenErrorResponse,
    UnauthorizedErrorResponse,
    dashboardURLResponse,
    forbiddenError,
    notFoundError,
    roleType,
    serverErrorType,
} from '../helpers/types';
import logger from '../middleware/logger';
import { AuthenticationError } from '../middleware/AuthenticationError';
import { decodingJWT } from '../helpers/auth';
import { authenticate } from '../middleware/authentication';

@Middlewares(authenticate)
@Route('dashboard')
export class DashboardController {
    /**
     * Endpoint for getting the Metabase dashboard URL.
     * @returns The iframe URL for embedding if SuperAdmin and signing is successful, and an error otherwise
     */
    @Get('/')
    public async getDashboardURL(
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
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Request() req: req,
    ): Promise<dashboardURLResponse> {
        // Check role before continuing
        try {
            const role = decodingJWT(req.cookies.token)?.payload.role;
            if ((role as roleType) !== roleType.SuperAdmin) {
                throw new AuthenticationError(
                    `Dashboards are not available for this user`,
                    403,
                );
            }
        } catch (err) {
            if (err instanceof AuthenticationError) {
                logger.warn(
                    `Encountered 403 forbidden error in getDashboardURL: ${err.message}`,
                );
                return forbiddenErrorResponse(403, {
                    message: err.message,
                    code: 403,
                });
            }
            if (err instanceof Error) {
                logger.warn(
                    `Encountered 404 not found error in getDashboardURL: ${err.message}`,
                );
                return notFoundErrorResponse(404, {
                    message: err.message,
                    code: 404,
                });
            }
        }
        const METABASE_SITE_URL = process.env.METABASE_SITE_URL
            ? process.env.METABASE_SITE_URL
            : '';
        const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY
            ? process.env.METABASE_SECRET_KEY
            : '';
        const METABASE_EXPIRY_MINUTES =
            process.env.METABASE_EXPIRY_MINUTES &&
            Number.isInteger(parseInt(process.env.METABASE_EXPIRY_MINUTES))
                ? parseInt(process.env.METABASE_EXPIRY_MINUTES)
                : 30;

        const payload = {
            resource: { dashboard: 2 },
            params: {},
            exp: Math.round(Date.now() / 1000) + METABASE_EXPIRY_MINUTES * 60,
        };
        let token;
        try {
            token = sign(payload, METABASE_SECRET_KEY);
        } catch (err) {
            if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in getDashboardURL: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        const url =
            METABASE_SITE_URL +
            '/embed/dashboard/' +
            token +
            '#bordered=true&titled=true';
        return { url };
    }
}
