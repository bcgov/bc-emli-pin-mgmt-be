import { app } from '../../index';
import request from 'supertest';
import * as ActivePIN from '../../db/ActivePIN.db';
import PINGenerator from '../../helpers/PINGenerator';
// mock out db
import { ActivePin } from '../../entity/ActivePin';
import { DataSource, EntityMetadata } from 'typeorm';

jest.spyOn(ActivePIN, 'findPin').mockImplementation(
    async (select?: object | undefined, where?: object | undefined) => {
        const result = [{ pin: 'A' }];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((where as any).pin === 'A') return result as ActivePin[];
        return [];
    },
);

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

describe('Pin endpoints', () => {
    /*
	  /create endpoint tests
	*/
    test('create should return a unique pin', async () => {
        const res = await request(app).get('/pins/create');
        expect(res.statusCode).toBe(200);
        expect(res.body.pin.length).toBe(8);
    });

    test('create too short PIN (length < 1) returns 422', async () => {
        const res = await request(app)
            .get('/pins/create')
            .query({ pinLength: 0 });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('create with guaranteed repeated pin returns 422', async () => {
        const res = await request(app)
            .get('/pins/create')
            .query({ pinLength: 1, allowedChars: 'A' });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Too many PIN creation attempts: consider expanding your pin length or character set to allow more unique PINs.',
        );
    });

    test('create PIN with no characters in set returns default character set pin', async () => {
        const res = await request(app)
            .get('/pins/create')
            .query({ allowedChars: '' });
        expect(res.statusCode).toBe(200);
        expect(res.body.pin.length).toBe(8);
    });

    test('create pin with unknown error returns 500', async () => {
        jest.spyOn(PINGenerator.prototype, 'create').mockImplementationOnce(
            () => {
                throw new Error('An unknown error occurred');
            },
        );
        const res = await request(app).get('/pins/create');
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('An unknown error occurred');
    });

    /*
		/initial-create endpoint test
	*/
    test('initial create should return 2 unique pins', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 2 });
        expect(res.statusCode).toBe(200);
        expect(res.body.pins.length).toBe(2);
        expect(res.body.pins[0]).not.toEqual(res.body.pins[1]);
    });

    test('initial create with too few pins returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 0 });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'The number of PINS created must be greater than 0.',
        );
    });

    test('initial create with guaranteed repeated pin returns 422', async () => {
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

    test('initial create PIN with no characters in set returns default character set pin', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 1, allowedChars: '' });
        expect(res.statusCode).toBe(200);
        expect(res.body.pins.length).toBe(1);
        expect(res.body.pins[0].length).toEqual(8);
    });

    test('initial create PIN with no quantity returns 422', async () => {
        const res = await request(app).get('/pins/initial-create');
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Validation Failed');
    });

    test('initial create pin with unknown error returns 500', async () => {
        jest.spyOn(
            PINGenerator.prototype,
            'initialCreate',
        ).mockImplementationOnce(() => {
            throw new Error('An unknown error occurred');
        });
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 1 });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('An unknown error occurred');
    });
});
