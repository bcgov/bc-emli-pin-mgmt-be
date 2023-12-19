import { app } from '../../index';
import request from 'supertest';
import {
    SampleSuperAdminTokenPayload,
    SampleBCEIDBUsinessAdminTokenPayload,
} from '../commonResponses';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import * as auth from '../../helpers/auth';

let token: string;

describe('Dashboard endpoints', () => {
    beforeAll(() => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });
    afterEach(() => {
        process.env.METABASE_SECRET_KEY = 'abcd';
        process.env.METABASE_SITE_URL = 'http://www.google.com';
        process.env.METABASE_EXPIRY_MINUTES = '10';
        const JWT_SECRET = 'abcd';
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('/dashboard with superadmin credentials returns 200', async () => {
        const res = await request(app)
            .get('/dashboard')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(
            res.body.url.includes(
                process.env.METABASE_SITE_URL + '/embed/dashboard',
            ),
        ).toBeTruthy();
        expect(
            res.body.url.includes('#bordered=true&titled=true'),
        ).toBeTruthy();
    });

    test('/dashboard without superadmin credentials returns 403', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(SampleBCEIDBUsinessAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const res = await request(app)
            .get('/dashboard')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            'Dashboards are not available for this user',
        );
    });

    test('/dashboard should return 404 on generic authentication error', async () => {
        jest.spyOn(auth, 'decodingJWT').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const res = await request(app)
            .get('/dashboard')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe(`Oops!`);
    });

    test('/dashboard with no secret key returns 500', async () => {
        delete process.env.METABASE_SECRET_KEY;
        delete process.env.METABASE_SITE_URL;
        process.env.METABASE_EXPIRY_MINUTES = 'hijk';
        const res = await request(app)
            .get('/dashboard')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('secretOrPrivateKey must have a value');
    });
});
