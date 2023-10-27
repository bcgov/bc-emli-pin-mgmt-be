import { Request } from 'express';
import { expressAuthentication } from '../../middleware/apiKeyAuth';
import { AuthenticationError } from '../../middleware/AuthenticationError';
import 'dotenv/config';
const oldAPIKey = process.env.VHERS_API_KEY;

describe('api key auth tests', () => {
    test('api key auth with wrong security name returns error', async () => {
        const req = {} as unknown as Request;
        process.env.VHERS_API_KEY =
            process.env.VHERS_API_KEY && process.env.VHERS_API_KEY !== ''
                ? ''
                : 'abcd';
        try {
            await expressAuthentication(req, 'wrong_secutity_name');
        } catch (err) {
            if (err instanceof AuthenticationError) {
                expect(err.status).toBe(400);
                expect(err.message).toBe('Invalid Security Name');
            }
        }
    });
    afterAll(() => {
        process.env.VHERS_API_KEY = oldAPIKey;
        jest.resetModules();
    });
});
