import { Get, Route, Controller, Query } from 'tsoa';
import { findPropertyDetails } from '../db/ActivePIN.db';
import { propertyDetailsResponse } from '../../src/helpers/types';

@Route('propertyDetails')
export class PropertyDetailsController extends Controller {
    @Get('getDetails')
    public async getPropertyDetails(
        @Query() pid: number,
    ): Promise<propertyDetailsResponse> {
        const result = await findPropertyDetails(pid);
        return {
            result,
        };
    }
}
