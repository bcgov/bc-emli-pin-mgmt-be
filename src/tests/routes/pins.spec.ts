import { app } from '../../index';
import request from 'supertest';

describe('Pin endpoints', () => {
    it('initial create should return 2 unique pins', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 2 });
        expect(res.statusCode).toBe(200);
        expect(res.body.pins.length).toBe(2);
        expect(res.body.pins[0]).not.toEqual(res.body.pins[1]);
    });

    it('initial create with too few pins returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 0 });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'The number of PINS created must be greater than 0.',
        );
    });

    it('initial create with guaranteed repeated pin returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 9, pinLength: 3, allowedChars: 'AB' });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.',
        );
    });

    test('initial create too short PIN (length < 1) returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 1, pinLength: 0 });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('initial create PIN with no characters in set returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 1, pinLength: 2, allowedChars: '' });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.',
        );
    });

    test('initial create PIN with no quantity returns 422', async () => {
        const res = await request(app).get('/pins/initial-create');
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Validation Failed');
    });
});
