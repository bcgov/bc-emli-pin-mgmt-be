// eslint-disable spaced-comment
import { Get, Route, Controller, TsoaResponse, Res, Path, Query } from 'tsoa';
import logger from '../middleware/logger';
import GeocodeAPICaller from '../helpers/geocodeAPICaller';
import {
    geocoderReferenceErrorType,
    getAddressResults,
    pinRangeErrorType,
    propertyDetailsResponse,
    searchRangeErrorType,
    serverErrorType,
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

    /**
     * Used to get property owner details from a given a site ID
     * - Step 1: Call bc geocoder parcel API to get PIDs from site ID
     * - Step 2: Check database and return property details for properties with a matching PID
     * Expected error codes and messages:
     * - 200
     * -- 'OK'
     * - 204
     *  -- 'No Content
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

    @Get('details')
    public async getPropertyDetails(
        @Query() siteID: string,
    ): Promise<propertyDetailsResponse> {
        const parcelsApiUrl = `${process.env.BCGEOCODER_TEST_API_URL_PID}`;
        const jsonFormat = '.json';

        const pid = async () => {
            try {
                return await axios.get(
                    `${parcelsApiUrl}${siteID}${jsonFormat}`,
                    {
                        headers: {
                            apikey: `${process.env.BCGEOCODER_API_KEY_PID}`,
                        },
                    },
                );
            } catch (err) {
                logger.debug(err);
                return err;
            }
        };

        const pidsData: any = await pid();
        const result = await findPropertyDetails(parseInt(pidsData.data.pids));
        return result;
    }
}
