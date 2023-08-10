import axios from 'axios';
import { app } from '../../index';
import request from 'supertest';
import {
    geocodeAddressAPIResponse,
    geocodeParcelAPIResponse,
    ActivePINResponse,
} from '../commonResponses';
import { AxiosError } from 'axios';
import { ActivePin } from '../../entity/ActivePin';
import * as ActivePIN from '../../db/ActivePIN.db';
import { DataSource, EntityMetadata } from 'typeorm';

describe('Properties endpoints', () => {
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

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.spyOn(ActivePIN, 'findPin').mockImplementation(
    async (select?: object | undefined, where?: object | undefined) => {
        const result = [ActivePINResponse];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((where as any).pid === '030317304')
            return result as unknown as ActivePin[];
        return [];
    },
);

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

describe('Properties endpoints', () => {
    test('/address should return results with valid input', async () => {
        // First mock call to geocoder parcel API

        const res: any = mockedAxios.get.mockResolvedValue({
            statusCode: 200,
            data: geocodeParcelAPIResponse,
        });
        const response = await res();
        expect(response.statusCode).toBe(200);
        expect(response.data.siteID).toBe(
            '785d65a0-3562-4ba7-a078-e088a7aada7c',
        );
        expect(response.data.pids).toBe('030317304');

        // Now mock call to database

        const dbPIDs = await ActivePIN.findPin(undefined, {
            pid: response.data.pids,
        });
        expect(dbPIDs.length).toEqual(1);
        expect(dbPIDs[0].addressLine_1 === '123 Main Street');
    });

    afterEach(() => {
        process.env.GEOCODER_API_ADDRESSES_ENDPOINT = 'https://google.ca/';
        process.env.GEOCODER_API_BASE_URL = 'endpoint_name.json';
    });
});
