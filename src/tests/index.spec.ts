import { app } from '../index';
import request from 'supertest';

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
});
