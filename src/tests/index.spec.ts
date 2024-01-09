import 'dotenv/config';
const oldAppURL = process.env.FE_APP_URL;
const oldPort = process.env.SERVER_PORT;
process.env.FE_APP_URL = process.env.FE_APP_URL?.includes('localhost')
    ? ''
    : 'localhost';
process.env.SERVER_PORT = process.env.SERVER_PORT === '3000' ? '6789' : '3000';
import { app, origin, errorHandler } from '../index';
import request from 'supertest';
import { Request, Response } from 'express';

describe('Index tests', () => {
    test('/api-specs/swagger-ui-int.js should return 200', async () => {
        const res = await request(app).get('/api-specs/swagger-ui-int.js');
        expect(res.statusCode).toBe(200);
    });

    test('/helloworld should return 200', async () => {
        const res = await request(app).get('/helloworld');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toEqual('Goodbye, moon!');
    });

    test('non-existent url should return 404', async () => {
        const res = await request(app).get('/thisdoesnotexist');
        expect(res.statusCode).toBe(404);
    });

    test('origin should throw error when given an origin not in the corsDomain', async () => {
        const callback = function (error: Error | null, success?: boolean) {
            if (error instanceof Error) throw error;
            else return success;
        };
        try {
            origin('z', callback);
        } catch (err) {
            if (err instanceof Error) {
                expect(err.message).toBe('Not allowed by CORS');
                return;
            }
        }
        fail();
    });

    test('error handler should return generic internal server error', () => {
        let result = { message: '' };
        const res = {} as unknown as Response;
        res.json = jest.fn().mockImplementationOnce((object) => {
            result = object;
        });
        res.status = jest.fn(() => res);
        const req = {} as unknown as Request;
        const next = jest.fn();
        errorHandler(new Error('Unknown'), req, res, next);
        expect(result.message).toBe('Internal Server Error');
    });

    test('error handler should go to next function when not given an error', () => {
        let result = { message: 'this is unaltered' };
        const res = {} as unknown as Response;
        res.json = jest.fn().mockImplementationOnce((object) => {
            result = object;
        });
        res.status = jest.fn(() => res);
        const req = {} as unknown as Request;
        const next = () => {};
        errorHandler('not an error', req, res, next);
        expect(result.message).toBe('this is unaltered');
    });

    afterAll(() => {
        process.env.FE_APP_URL = oldAppURL;
        process.env.SERVER_PORT = oldPort;
        jest.resetModules();
    });
});
