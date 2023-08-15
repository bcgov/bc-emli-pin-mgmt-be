// eslint-disable spaced-comment
import { Get, Route, Controller, TsoaResponse, Res, Path, Query } from 'tsoa';
import logger from '../middleware/logger';
import GeocodeAPICaller from '../helpers/geocodeAPICaller';
import {
    badRequestError,
    forbiddenError,
    geocoderReferenceErrorType,
    getAddressResults,
    notFoundError,
    pidNotFound,
    pinRangeErrorType,
    propertyDetailsResponse,
    searchRangeErrorType,
    serverErrorType,
    unauthorizedError,
} from '../helpers/types';
import { findPropertyDetails } from '../db/ActivePIN.db';
import axios from 'axios';

@Route('properties')
export class PropertiesController extends Controller {
    /**
     * Used to search for a siteID for a property, giving potentially multiple results.
     * Expected error codes and messages:
     * - `404`
     * -- `Not Found` (when not passing in a path parameter as required)
     * - `422`
     * -- `Geocoder API base URL or 'addresses' endpoint URL is undefined.`
     * -- `Search string must be of length 3 or greater`
     * - `500`
     *  -- `Internal Server Error`
     * @param address The address you wish to find the siteID for
     * @returns An object with an array of search results.
     *  Each result contains the match score (from 50-100, 100 being a perfect match) of the result,
     *  the full address of the property, and the siteID
     */

    @Get('address/{address}')
    public async getSiteID(
        @Res() rangeErrorResponse: TsoaResponse<422, searchRangeErrorType>,
        @Res()
        referenceErrorResponse: TsoaResponse<422, geocoderReferenceErrorType>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Path() address: string,
    ): Promise<getAddressResults> {
        const caller = new GeocodeAPICaller();
        let res: getAddressResults = { results: [] };
        try {
            res = await caller.getAddress(address);
        } catch (err) {
            if (err instanceof RangeError) {
                logger.warn(
                    `Encountered Range Error in getSiteID: ${err.message}`,
                );
                return rangeErrorResponse(422, {
                    message: err.message,
                } as pinRangeErrorType);
            } else if (err instanceof ReferenceError) {
                logger.warn(
                    `Encountered Reference Error in getSiteID: ${err.message}`,
                );
                return referenceErrorResponse(422, { message: err.message });
            } else if (err instanceof Error) {
                logger.warn(
                    `Encountered unknown Internal Server Error in getSiteID: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return res;
    }

    /**
     * Used to get property owner details from a given a site ID
     * Step 1: Call bc geocoder parcel API to get PIDs from site ID
     * Step 2: Check database and return property details for properties with a matching PID
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

    @Get('details')
    public async getPropertyDetails(
        @Res() unauthorizedErrorResponse: TsoaResponse<401, unauthorizedError>,
        @Res() badRequestErrorResponse: TsoaResponse<400, badRequestError>,
        @Res() forbiddenErrorResponse: TsoaResponse<403, forbiddenError>,
        @Res() notFoundErrorResponse: TsoaResponse<404, notFoundError>,
        @Res() serverErrorResponse: TsoaResponse<500, serverErrorType>,
        @Res() pidNotFoundResponse: TsoaResponse<204, pidNotFound>,
        @Query() siteID: string,
        @Query() role: string,
    ): Promise<Array<propertyDetailsResponse>> {
        const results: Array<propertyDetailsResponse> = [];
        try {
            const parcelsApiUrl = `${process.env.BCGEOCODER_TEST_API_URL_PID}`;
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
            const pidsArray = pidsData.data.pids.split('|');

            for (const pid of pidsArray) {
                const result = await findPropertyDetails(parseInt(pid), role);
                if (result[0] === undefined) {
                    logger.warn(
                        `Encountered a 204 message in getPropertyDetails. The retrieved pid does not exist in the database.`,
                    );
                    const exception: pidNotFound = {
                        message: `Encountered a 204 message in getPropertyDetails. The following pid does not exist in the database: ${pid}`,
                        code: 204,
                    };
                    throw exception;
                }
                results.push(await result);
            }
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
            } else if (err.code === 204) {
                return pidNotFoundResponse(204, {
                    message: err.message,
                    code: err.code,
                });
            } else {
                logger.warn(
                    `Encountered 500 unknown Internal Server Error in getPropertyDetails: ${err.message}`,
                );
                return serverErrorResponse(500, { message: err.message });
            }
        }
        return results;
    }
}
