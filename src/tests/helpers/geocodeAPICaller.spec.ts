import axios from 'axios';
import GeocodeAPICaller from '../../helpers/geocodeAPICaller';
import { AxiosError } from 'axios';
import {
    emptyAddressAPIResponse,
    geocodeAddressAPIResponse,
    unsortedAddressAPIResponse,
} from '../commonResponses';

describe('Geocode API Caller tests', () => {
    test('geocode api caller should return one result', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(
            geocodeAddressAPIResponse,
        );
        const caller = new GeocodeAPICaller();
        const res = await caller.getAddress(
            '525 Superior Street, Victoria, BC',
        );
        expect(res.results.length).toBe(1);
        expect(res.results[0].score).toBe(100);
        expect(res.results[0].fullAddress).toBe(
            '525 Superior St, Victoria, BC',
        );
        expect(res.results[0].siteID).toBe(
            'dc9357ba-7f40-4395-9eda-219ca5f475c0',
        );
    });

    test('geocode api caller should sort unsorted results descending', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(
            unsortedAddressAPIResponse,
        );
        const caller = new GeocodeAPICaller();
        const res = await caller.getAddress('100 Main St');
        expect(res.results.length).toBe(3);
        expect(res.results[0].score).toBe(90);
        expect(res.results[1].score).toBe(89);
        expect(res.results[2].score).toBe(88);
    });

    test('geocode api caller should throw error on too short search', async () => {
        const caller = new GeocodeAPICaller();
        await expect(caller.getAddress('52')).rejects.toThrow(
            'Search string must be of length 3 or greater',
        );
    });

    test('geocode api caller should throw error with no endpoint provided', async () => {
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT = '';
        process.env.GEOCODER_API_BASE_URL = '';
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('525 Superior Street, Victoria, BC'),
        ).rejects.toThrow(
            `Geocoder API base URL or 'addresses' endpoint URL is undefined.`,
        );
    });

    test('geocode api caller should throw on axios error', async () => {
        jest.spyOn(axios, 'get').mockImplementationOnce(() => {
            throw new AxiosError('Request failed with status code 404');
        });
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('525 Superior Street, Victoria, BC'),
        ).rejects.toThrow(`Request failed with status code 404`);
    });

    test('geocode api caller should throw on generic error', async () => {
        jest.spyOn(axios, 'get').mockImplementationOnce(() => {
            throw new Error('An unknown error occurred.');
        });
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('525 Superior Street, Victoria, BC'),
        ).rejects.toThrow(`An unknown error occurred.`);
    });

    test('geocode api caller should throw on empty response', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(emptyAddressAPIResponse);
        const caller = new GeocodeAPICaller();
        await expect(
            caller.getAddress('this address does not exist'),
        ).rejects.toThrow(
            `No results found for search string 'this address does not exist'`,
        );
    });
    afterEach(() => {
        jest.clearAllMocks();
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT = 'https://google.ca/';
        process.env.GEOCODER_API_BASE_URL = 'endpoint_name.json';
    });
});
