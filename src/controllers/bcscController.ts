// controllers/bscsController.ts
import {
    Controller,
    Get,
    Query,
    Res,
    Route,
    Tags,
    TsoaResponse,
    Security,
} from 'tsoa';

require('dotenv/config');

import { getAuthorizationUrl } from '../helpers/auth';
import { pidStringSplitAndSort, getPIDs } from '../helpers/pidHelpers';
import {
    getAddressResults,
    badRequestError,
    serverErrorType,
    GenericTypeORMErrorType,
    InvalidTokenErrorResponse,
    UnauthorizedErrorResponse,
    // ApiError,
} from '../helpers/types';
import GeocodeAPICaller from '../helpers/geocodeAPICaller';
import { compareNames } from '../helpers/nameMatching';

import logger from '../middleware/logger';

import { findPropertyDetails, updateActivePin } from '../db/ActivePIN.db';
import { TypeORMError } from 'typeorm';
import { encryptJson } from '../helpers/crypto';

const validationKey = process.env.VALIDATION_KEY;

@Route('bcsc')
@Tags('BCSC')
export class BscsController extends Controller {
    /**
     *
     */
    @Security('vhers_api_key')
    @Get('/key')
    public async getValidationKey(
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
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
    ) {
        try {
            return validationKey;
        } catch (err) {
            if (err instanceof Error) {
                const message = `Error in getValidationKey: failed to get key`;
                logger.warn(message);
                return serverErrorResponse(500, { message });
            }
        }
    }

    /**
     * Initiates the BCSC login by redirecting the user to the authorization URL.
     * @param redirectResponse - TSOA response object for redirection (307).
     * @param serverErrorResponse - TSOA response object for handling server errors (500).
     * @param siteid - The site identifier passed as a query parameter.
     */
    @Get('/')
    public async initiateLogin(
        @Res() redirectResponse: TsoaResponse<307, void>,
        @Res()
        serverErrorResponse: TsoaResponse<
            500,
            { success: boolean; error: string }
        >,
        @Query() siteid: string,
        @Query() redirect: string,
    ): Promise<void> {
        try {
            // Get the authorization URL with the 'bcsc' identity provider
            const authUrl = await getAuthorizationUrl({
                identity_provider: 'bcsc',
                siteId: siteid,
                redirect: redirect,
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

    // @Get('/validate')
    // public async validateUserData(
    //     @Res() successResponse: TsoaResponse<200, validateUserResponse>,
    //     @Res() badRequestErrorResponse: TsoaResponse<400, validateUserResponse>,
    //     @Res()
    //     serverErrorResponse: TsoaResponse<
    //         500,
    //         { success: boolean; error: string }
    //     >,
    //     @Query() livePinId: string,
    //     @Query() bcscId: string,
    //     @Query() pids: string[],
    // ): Promise<void> {
    //     const ownerResults = await findPropertyDetails(pids, ['VIEW_PIN']);
    //     let matchingOwner;

    //     if (livePinId) {
    //         matchingOwner = ownerResults.find(
    //             (f: any) => f.livePinId === livePinId,
    //         );
    //     }

    //     if (matchingOwner) {
    //         return successResponse(200, {
    //             success: true,
    //             message: 'successful',
    //         });
    //     } else {
    //         return badRequestErrorResponse(400, {
    //             success: false,
    //             message: 'failure',
    //         });
    //     }
    // }

    /**
     * Handles the callback after the user authenticates with BCSC.
     * @param typeORMErrorResponse - TSOA response for handling TypeORM errors (422).
     * @param successResponse - TSOA response object for successful user info retrieval (200).
     * @param badRequestErrorResponse - TSOA response for handling bad requests (400).
     * @param serverErrorResponse - TSOA response for handling server errors (500).
     * @param pidOwnerNotFoundResponse - TSOA response for handling cases when PID is not found or Owner not matched (204).
     * @param code - The authorization code returned by the BCSC login.
     * @param state - The state parameter, parsed to find the site ID for the user.
     */
    @Get('/userinfo')
    public async handleCallback(
        @Res() typeORMErrorResponse: TsoaResponse<422, GenericTypeORMErrorType>,
        @Res() redirectResponse: TsoaResponse<302, any>,
        @Res() badRequestErrorResponse: TsoaResponse<400, badRequestError>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        // @Res() failureResponse: TsoaResponse<204, ApiError>,
        @Query() code: string,
        @Query() state: string,
    ): Promise<void> {
        try {
            let matchingOwner: any;

            const jsonReturn = {
                bcscId: null,
                livePinId: null,
                pids: [],
            };

            if (!code)
                throw new Error('Authorization code is missing or invalid'); // Check for a valid authorization code

            const parsedState = JSON.parse(decodeURIComponent(state));
            const siteId = parsedState.siteId;

            // console.log(parsedState);
            let redirectURI = `${parsedState.redirect}`;

            // Step 1: Exchange the authorization code for a token
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

            // Step 2: Use the access token to request the users info
            const userInfoResponse = await fetch(
                `${process.env.CSS_DOMAIN_NAME_URL}/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`,
                    },
                },
            );

            const userInfo = await userInfoResponse.json();
            // BCSC has a unique id but it's in the form of <id>@<bcsc_client_id>
            const bcscId = userInfo.sub.split('@')[0];

            // Call the geocode API to get the user's address details
            let res: getAddressResults = { results: [] };
            res = await new GeocodeAPICaller().getAddress(
                `${userInfo.address.street_address} ${userInfo.address.locality} ${userInfo.address.region}`,
            );

            // Check if any address result matches the site ID in the parsed state
            const matchedResult = res.results.find(
                (p: any) => p.siteID === siteId,
            );

            const pidsData: any = await getPIDs(siteId);
            const pids = pidsData.data.pids;

            if (matchedResult) {
                jsonReturn.bcscId = bcscId;
                jsonReturn.pids = pids;
                const encryptedReturn = encryptJson(jsonReturn);
                redirectURI = `${redirectURI}?status=0&value=${encryptedReturn}`;
                redirectResponse(302, undefined, { Location: redirectURI });
            } else {
                const pidArray = pidStringSplitAndSort(pidsData.data.pids);
                // Fetch property details emulating VIEW_PIN permission
                let ownerResults = await findPropertyDetails(pidArray, [
                    'VIEW_PIN',
                ]);

                // we can shortcut here if the user info bcsc id is already added to the database, then we know the owner matches
                matchingOwner = ownerResults.find(
                    (f: any) => f.bcscId === bcscId,
                );

                if (!matchingOwner) {
                    // Iterate through owner results to calculate name matching weights
                    ownerResults = ownerResults.map((m: any) => {
                        return {
                            ...m,
                            nameWeight: compareNames(
                                `${m.givenName} ${m.lastName_1} ${m.lastName_2}`,
                                `${userInfo.given_names} ${userInfo.family_name}`,
                            ),
                        };
                    });

                    // Find the highest name weight to identify the best match
                    const highestMatchingOwner = ownerResults.find(
                        (f: any) =>
                            f.nameWeight ===
                            Math.max(
                                ...ownerResults.map((m: any) => m.nameWeight),
                            ),
                    );

                    if (highestMatchingOwner?.nameWeight > 80) {
                        matchingOwner = highestMatchingOwner;
                    }
                }

                if (matchingOwner) {
                    // Update the active pin record with the user's BCSC ID
                    await updateActivePin(
                        { livePinId: matchingOwner.livePinId },
                        { bcscId: bcscId },
                    );
                    jsonReturn.livePinId = matchingOwner.livePinId;
                    jsonReturn.bcscId = bcscId;
                    jsonReturn.pids = matchingOwner.pids;

                    const encryptedReturn = encryptJson(jsonReturn);
                    // Respond with success, including relevant user information
                    redirectURI = `${redirectURI}?status=0&value=${encryptedReturn}`;
                    redirectResponse(302, undefined, { Location: redirectURI });
                }

                redirectURI = `${redirectURI}?status=1`;
                redirectResponse(302, undefined, { Location: redirectURI });
            }

            redirectURI = `${redirectURI}?status=2`;
            redirectResponse(302, undefined, { Location: redirectURI });
        } catch (err: any) {
            if (err instanceof TypeORMError) {
                logger.warn(
                    `Encountered TypeORM Error updating user during BCSC login: ${err.message}`,
                );
                return typeORMErrorResponse(422, { message: err.message });
            }
            if (err.code === 400) {
                logger.warn(
                    `Encountered 400 bad request error in BCSC login handleCallback: ${err.message}`,
                );
                return badRequestErrorResponse(400, {
                    message: err.message,
                    code: err.code,
                });
            } else {
                logger.warn(
                    `Encountered 500 unknown Internal Server Error in BCSC login: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
    }
}
