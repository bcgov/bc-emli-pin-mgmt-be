// controllers/bscsController.ts
import { Controller, Get, Query, Res, Route, Tags, TsoaResponse } from 'tsoa';

import { getAuthorizationUrl } from '../helpers/auth';
import logger from '../middleware/logger';

interface UserInfoResponse {
    success: boolean;
    token?: string;
    refreshToken?: string;
    userInfo?: {
        sub: string;
        identity_provider: string;
        address: {
            street_address: string;
            locality: string;
            region: string;
            postal_code: string;
        };
        email_verified: boolean;
        preferred_username: string;
        given_names: string;
        family_name: string;
    };
}

@Route('bcsc')
@Tags('BCSC')
export class BscsController extends Controller {
    /**
     * Initiates the BCSC login by redirecting the user to the authorization URL.
     * @param redirectResponse - TSOA response object for redirection (307).
     * @param serverErrorResponse - TSOA response object for handling server errors (500).
     */
    @Get('/')
    public async initiateLogin(
        @Res() redirectResponse: TsoaResponse<307, void>,
        @Res()
        serverErrorResponse: TsoaResponse<
            500,
            { success: boolean; error: string }
        >,
    ): Promise<void> {
        try {
            // Get the authorization URL with the 'bcsc' identity provider
            const authUrl = await getAuthorizationUrl({
                identity_provider: 'bcsc',
            });
            // Redirect with TsoaResponse
            redirectResponse(307, undefined, { Location: authUrl });
        } catch (err) {
            if (err instanceof Error) {
                logger.error(err.message); // Log the error message
                // Respond with a server error
                serverErrorResponse(500, {
                    success: false,
                    error: err.message,
                });
            }
        }
    }

    /**
     * Handles the callback after the user authenticates with BCSC.
     * @param successResponse - TSOA response object for successful user info retrieval (200).
     * @param invalidTokenErrorResponse - TSOA response object for handling invalid token errors (400).
     * @param serverErrorResponse - TSOA response object for handling server errors (500).
     * @param code - The authorization code returned by the BCSC login.
     */
    @Get('/userinfo')
    public async handleCallback(
        @Res() successResponse: TsoaResponse<200, UserInfoResponse>,
        @Res()
        invalidTokenErrorResponse: TsoaResponse<
            400,
            { success: boolean; error: string }
        >,
        @Res()
        serverErrorResponse: TsoaResponse<
            500,
            { success: boolean; error: string }
        >,
        @Query() code: string,
        // @Query() siteID: string,
    ): Promise<void> {
        try {
            if (!code)
                throw new Error('Authorization code is missing or invalid'); // Check for a valid authorization code

            // Step 1: Exchange the authorization code for tokens
            const tokenResponse = await fetch(
                `${process.env.CSS_DOMAIN_NAME_URL}/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: process.env.OIDC_GRANT_TYPE || '',
                        client_id: process.env.BCSC_OIDC_CLIENT_ID || '',
                        client_secret:
                            process.env.BCSC_OIDC_CLIENT_SECRET || '',
                        code,
                        redirect_uri: `${process.env.BE_APP_URL}/bcsc/userinfo`,
                    }),
                },
            );

            const tokenData = await tokenResponse.json();
            if (!tokenData.access_token)
                throw new Error('Token exchange failed'); // Ensure the token exchange was successful

            // Step 2: Use the access token to request user info
            const userInfoResponse = await fetch(
                `${process.env.CSS_DOMAIN_NAME_URL}/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                },
            );

            const userInfo = await userInfoResponse.json();

            logger.info(`User Info: ${JSON.stringify(userInfo)}`); // Log the user information

            // Respond with success, including tokens and user info
            return successResponse(200, {
                success: true,
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                userInfo,
            });
        } catch (err) {
            if (err instanceof Error) {
                logger.error(err.message); // Log the error message
                if (
                    err.message.includes(
                        'Authorization code is missing or invalid',
                    )
                ) {
                    // Handle invalid token error
                    invalidTokenErrorResponse(400, {
                        success: false,
                        error: err.message,
                    });
                } else {
                    // Handle server error
                    serverErrorResponse(500, {
                        success: false,
                        error: err.message,
                    });
                }
            }
        }
    }
}
