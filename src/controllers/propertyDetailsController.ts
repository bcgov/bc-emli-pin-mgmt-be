import { Get, Route, Controller, Query } from 'tsoa';
import { findPropertyDetails } from '../db/ActivePIN.db';
import { propertyDetailsResponse } from '../../src/helpers/types';
import axios from 'axios';
import logger from '../middleware/logger';

@Route('properties')
export class PropertyDetailsController extends Controller {
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
        console.log(pidsData.data.pids);

        const result = await findPropertyDetails(parseInt(pidsData.data.pids));
        return result;
    }
}
