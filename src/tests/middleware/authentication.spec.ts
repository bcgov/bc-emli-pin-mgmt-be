import { app } from '../../index';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { SampleSuperAdminTokenPayload } from '../commonResponses';

describe('Authentication tests', () => {
    // Using a simple endpoint to test this, as it is easier than testing the middleware directly
    test('authenticate should return false if no token exists on request', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 2 });
        expect(res.status).toBe(404);
        expect(res.body.success).toBeFalsy();
        expect(res.body.msg).toBe('Token not found');
    });

    test('authenticate should return false if signature on token is invalid', async () => {
        const token = jwt.sign(SampleSuperAdminTokenPayload, 'efgh', {
            expiresIn: 30 * 60 * 1000,
        });
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 2 })
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.status).toBe(401);
        expect(res.body.success).toBeFalsy();
        expect(res.body.msg).toBe('invalid signature');
    });

    test('authenticate should return error result if verify does not work', async () => {
        const token = jwt.sign(SampleSuperAdminTokenPayload, 'abcd', {
            expiresIn: 30 * 60 * 1000,
        });
        jest.spyOn(jwt, 'verify').mockReturnValueOnce(undefined);
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 2 })
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.status).toBe(200);
        expect(res.body.result).toBe('Token verification failed');
    });
});
