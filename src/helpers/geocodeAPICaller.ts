import { get } from 'axios';
import 'dotenv/config';
import { getAddressResults } from './types';
import { AxiosError } from 'axios';

export default class GeocodeAPICaller {
    public async getAddress(searchString: string): Promise<getAddressResults> {
        if (searchString.length < 3) {
            throw new RangeError(
                `Search string must be of length 3 or greater`,
            );
        }
        const address =
            process.env.GEOCODER_API_BASE_URL &&
            process.env.GEOCODER_API_ADDRESSES_ENDPOINT
                ? process.env.GEOCODER_API_BASE_URL +
                  process.env.GEOCODER_API_ADDRESSES_ENDPOINT
                : '';
        if (address === '') {
            throw new ReferenceError(
                `Geocoder API base URL or 'addresses' endpoint URL is undefined.`,
            );
        }
        const config = {
            params: {
                addressString: searchString,
                maxResults: 101,
                minScore: 50,
                autoComplete: true,
            },
        }; // max is 101
        let response = {
            data: {
                features: [
                    { properties: { siteID: '', score: 0, fullAddress: '' } },
                ],
            },
        };
        try {
            response = await get(address, config);
        } catch (err) {
            if (err instanceof AxiosError) throw new AxiosError(err.message);
            else if (err instanceof Error)
                throw new Error(`An unknown error occured:${err.message}`);
        }
        if (response.data.features.length === 0) {
            throw new Error(
                `No results found for search string '${searchString}'`,
            );
        }
        const returnResults: getAddressResults = { results: [] };
        for (const feature of response.data.features) {
            if (feature.properties.siteID !== '')
                // property is well defined enough to have a site ID
                returnResults.results.push({
                    score: feature.properties.score,
                    fullAddress: feature.properties.fullAddress,
                    siteID: feature.properties.siteID,
                });
        }
        returnResults.results.sort((a, b) => (a.score < b.score ? 1 : -1)); // sort results DESC
        return returnResults;
    }
}
