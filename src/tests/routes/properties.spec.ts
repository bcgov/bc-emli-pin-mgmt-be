import axios from 'axios';
import { app } from '../../index';
import request from 'supertest';
import { geocodeAddressAPIResponse } from '../commonResponses';
import { AxiosError } from 'axios';

describe('Properties endpoints', () => {
    beforeEach(() => {
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT = 'https://google.ca/';
        process.env.GEOCODER_API_BASE_URL = 'endpoint_name.json';
    });

    test('/address should return results with valid input', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(
            geocodeAddressAPIResponse,
        );
        const res = await request(app).get(
            '/properties/address/525 Superior Street',
        );
        expect(res.statusCode).toBe(200);
        expect(res.body.results[0].score).toBe(100);
        expect(res.body.results[0].fullAddress).toBe(
            '525 Superior St, Victoria, BC',
        );
        expect(res.body.results[0].siteID).toBe(
            'dc9357ba-7f40-4395-9eda-219ca5f475c0',
        );
    });

    test('/address with too short search returns 422', async () => {
        const res = await request(app).get('/properties/address/ab');
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Search string must be of length 3 or greater',
        );
    });

    test('/address with no endpoint in environment returns 422', async () => {
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT = '';
        process.env.GEOCODER_API_BASE_URL = '';
        const res = await request(app).get(
            '/properties/address/525 Superior Street',
        );
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            `Geocoder API base URL or 'addresses' endpoint URL is undefined.`,
        );
    });

    test('/address with axios error returns 500', async () => {
        jest.spyOn(axios, 'get').mockImplementationOnce(() => {
            throw new AxiosError('An unknown error occurred.');
        });
        const res = await request(app).get(
            '/properties/address/525 Superior Street',
        );
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(`An unknown error occurred.`);
    });

    test('/address with no address parameter returns 404', async () => {
        const res = await request(app).get('/properties/address');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Not Found');
    });

    afterEach(() => {
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT = 'https://google.ca/';
        process.env.GEOCODER_API_BASE_URL = 'endpoint_name.json';
    });
});
