import axios from 'axios';
import { app } from '../../index';
import request from 'supertest';
import {
    geocodeAddressAPIResponse,
    geocodeParcelAPIResponse_1,
    geocodeParcelAPIResponse_2,
    ActivePINResponse,
} from '../commonResponses';
import { AxiosError } from 'axios';
import { ActivePin } from '../../entity/ActivePin';
import * as ActivePIN from '../../db/ActivePIN.db';

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

jest.spyOn(ActivePIN, 'findPropertyDetails').mockImplementation(
    async (pid: string[]): Promise<any> => {
        const result = [ActivePINResponse, ActivePINResponse];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (pid[0] === '030317304') return result as unknown as ActivePin[];
        return [];
    },
);

describe('Properties endpoints', () => {
    test('/details should return results with valid input', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(
            geocodeParcelAPIResponse_1,
        );
        const res = await request(app).get(
            '/properties/details?siteID=785d65a0-3562-4ba7-a078-e088a7aada7c&role=Admin',
        );

        const body = await res.body['123|AB'][0];

        expect(res.statusCode).toBe(200);
        expect(body.titleNumber).toBe('123');
        expect(body.pids).toBe('9765107');
    });

    test('/details should return 204 for pid that is not in database', async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce(
            geocodeParcelAPIResponse_2,
        );
        const res = await request(app).get(
            '/properties/details?siteID=123&role=Admin',
        );

        expect(res.statusCode).toBe(204);
    });

    test('/details Throw 401 unauthorized error', async () => {
        jest.spyOn(axios, 'get').mockRejectedValueOnce({
            response: {
                status: 401,
            },
        });
        const res = await request(app).get(
            '/properties/details?siteID=12&role=Admin',
        );
        expect(res.statusCode).toBe(401);
    });

    test('/details Throw 400 bad request error', async () => {
        jest.spyOn(axios, 'get').mockRejectedValueOnce({
            response: {
                status: 400,
            },
        });
        const res = await request(app).get(
            '/properties/details?siteID=123&role=Admin',
        );
        expect(res.statusCode).toBe(400);
    });

    test('/details Throw 403 forbidden error', async () => {
        jest.spyOn(axios, 'get').mockRejectedValueOnce({
            response: {
                status: 403,
            },
        });
        const res = await request(app).get(
            '/properties/details?siteID=123&role=Admin',
        );
        expect(res.statusCode).toBe(403);
    });

    test('/details Throw 404 not found error', async () => {
        jest.spyOn(axios, 'get').mockRejectedValueOnce({
            response: {
                status: 404,
            },
        });
        const res = await request(app).get(
            '/properties/details?siteID=123&role=Admin',
        );
        expect(res.statusCode).toBe(404);
    });

    test('/details Throw 500 error', async () => {
        jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error());
        const res = await request(app).get(
            '/properties/details?siteID=123&role=Admin',
        );
        expect(res.statusCode).toBe(500);
    });
});
