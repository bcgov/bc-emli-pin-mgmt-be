import { Get, Route, Controller, Query } from 'tsoa';
import { findPropertyDetails } from '../db/ActivePIN.db';
import { propertyDetailsResponse } from '../../src/helpers/types';
import axios from 'axios';

@Route('propertyDetails')
export class PropertyDetailsController extends Controller {
    @Get('getDetails')
    public async getPropertyDetails(
        @Query() siteID: string,
    ): Promise<propertyDetailsResponse> {
        const parcelsApiUrl = `${process.env.BCGEOCODER_TEST_API_URL}`;
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
                console.error(err);
                return err;
            }
        };

        const pidsData: any = await pid();
        console.log(pidsData.data.pids);

        const result = await findPropertyDetails(parseInt(pidsData.data.pids));
        return result;
    }
}
