/* eslint-disable @typescript-eslint/no-unused-vars */
import { app } from '../../index';
import request from 'supertest';
import * as ActivePIN from '../../db/ActivePIN.db';
import PINGenerator from '../../helpers/PINGenerator';
// mock out db
import { ActivePin } from '../../entity/ActivePin';
import {
    DataSource,
    EntityMetadata,
    EntityNotFoundError,
    TypeORMError,
} from 'typeorm';
import { emailPhone, expirationReason } from '../../helpers/types';
import {
    ActivePINMultiResponse,
    invalidCreatePinBodyWrongPhone,
    invalidCreatePinBodyPinLength,
    validCreatePinBodyInc,
    validCreatePinBodyNameAddLineProvLong,
    validCreatePinBodySinglePid,
} from '../commonResponses';

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

describe('Pin endpoints', () => {
    /*
	  /create endpoint tests
	*/
    test('create should return a unique pin', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pid = 1234;
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.province = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const pin2 = new ActivePin();
                pin2.pid = 5678;
                pin2.titleNumber = 'EFGH';
                pin2.landTitleDistrict = 'BC';
                pin2.livePinId = 'af430240-e5b6-4224-bd71-a02e098cc6e8';
                pin2.incorporationNumber = '91011';
                pin2.addressLine_1 = '123 example st';
                pin2.city = 'Vancouver';
                pin2.province = 'BC';
                pin2.country = 'Canada';
                pin2.postalCode = 'V1V1V1';
                const result = [pin1, pin2];

                if (
                    (where as any)[0].pid === 1234 &&
                    (where as any)[1].pid === 5678
                )
                    return result as ActivePin[];
                return [];
            },
        );
        jest.spyOn(PINGenerator.prototype, 'create').mockImplementationOnce(
            async (
                pinLength?: number | undefined,
                allowedChars?: string | undefined,
            ) => {
                return { pin: 'ABCD1234' };
            },
        );
        jest.spyOn(ActivePIN, 'batchUpdatePin').mockImplementationOnce(
            async (
                updatedPins: ActivePin[],
                sendToInfo: emailPhone,
                requesterName?: string,
                requesterUsername?: string,
            ) => {
                if (updatedPins[0].pin === 'ABCD1234') return [];
                return [
                    `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                ];
            },
        );

        const reqBody = validCreatePinBodyInc;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pid).toBe(1234);
        expect(res.body[1].pin).toBe('ABCD1234');
        expect(res.body[1].pid).toBe(5678);
    });

    test('create should return a unique pin with numeric, singular pid', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pid = 1234;
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.province = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pid === 1234) return result as ActivePin[];
                return [];
            },
        );
        jest.spyOn(PINGenerator.prototype, 'create').mockImplementationOnce(
            async (
                pinLength?: number | undefined,
                allowedChars?: string | undefined,
            ) => {
                return { pin: 'ABCD1234' };
            },
        );
        jest.spyOn(ActivePIN, 'batchUpdatePin').mockImplementationOnce(
            async (
                updatedPins: ActivePin[],
                sendToInfo: emailPhone,
                requesterName?: string,
                requesterUsername?: string,
            ) => {
                if (updatedPins[0].pin === 'ABCD1234') return [];
                return [
                    `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                ];
            },
        );

        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pid).toBe(1234);
    });

    test('create on request body validation fail returns 422', async () => {
        const reqBody = invalidCreatePinBodyWrongPhone;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Validation Error(s) occured in createPin request body:',
        );
        expect(res.body.faults[0]).toBe(
            'Phone number must be a valid, 10 digit North American phone number prefixed with 1 or +1',
        );
    });

    test('create on request body on no updatable results (inc) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyInc;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pid 1234|5678 does not match the address and name / incorporation number given:' +
                `\nInc. # 91011` +
                `\n123 example st` +
                `\nVancouver, BC, Canada V1V1V1`,
        );
    });

    test('create on request body on no updatable results (name) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLineProvLong;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pid 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith ` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nVancouver, Lower Mainland, Canada `,
        );
    });

    test('create on request body on no updatable results (last name 2) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLineProvLong;
        reqBody.lastName_2 = 'Appleseed';
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pid 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith Appleseed` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nVancouver, Lower Mainland, Canada `,
        );
    });

    test('create on request body on no batch update returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pid = 1234;
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.province = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pid === 1234) return result as ActivePin[];
                return [];
            },
        );
        jest.spyOn(PINGenerator.prototype, 'create').mockImplementationOnce(
            async (
                pinLength?: number | undefined,
                allowedChars?: string | undefined,
            ) => {
                return { pin: 'ABCD1234' };
            },
        );
        jest.spyOn(ActivePIN, 'batchUpdatePin').mockImplementationOnce(
            async (
                updatedPins: ActivePin[],
                sendToInfo: emailPhone,
                requesterName?: string,
                requesterUsername?: string,
            ) => {
                return [
                    `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                ];
            },
        );

        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Error(s) occured in batchUpdatePin: ');
        expect(res.body.faults.length).toBe(1);
        expect(res.body.faults[0]).toBe(
            'An error occured while updating updatedPins[0] in batchUpdatePin: unknown error',
        );
    });

    test('create with guaranteed repeated pin returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pid = 1234;
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                (pin1.givenName = 'John'), (pin1.lastName_1 = 'Smith');
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.province = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pid === 1234) return result as ActivePin[];
                return [];
            },
        );
        const reqBody = invalidCreatePinBodyPinLength;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('create pin with unknown error returns 500', async () => {
        // Without mocking things, we should get a metadata error
        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
            `Cannot read properties of undefined (reading 'metadata')`,
        );
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

    /* 
		/expire endpoint tests 
	*/
    test('expire PIN should return expired PIN', async () => {
        const spy = jest
            .spyOn(ActivePIN, 'deletePin')
            .mockImplementationOnce(() => {
                return Promise.resolve(ActivePINMultiResponse[0] as ActivePin);
            });
        const res = await request(app).post('/pins/expire').send({
            livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
            expirationReason: expirationReason.ChangeOfOwnership,
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.livePinId).toBe('ca609097-7b4f-49a7-b2e9-efb78afb3ae6');
        spy.mockClear();
    });

    test('expire PIN should fail without name for non-system expirations', async () => {
        const res = await request(app).post('/pins/expire').send({
            livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
            expirationReason: expirationReason.CallCenterPinReset,
            expiredByUsername: 'Test',
        });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Must provide an expiration name when expiring a PIN',
        );
    });

    test('expire PIN should fail without username for non-system expirations', async () => {
        const res = await request(app).post('/pins/expire').send({
            livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
            expirationReason: expirationReason.CallCenterPinReset,
            expiredByName: 'Test',
        });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Must provide an expiration username when expiring a PIN',
        );
    });

    test('expire PIN without existing PIN returns 422', async () => {
        jest.clearAllMocks();
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new EntityNotFoundError(ActivePin, {
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
            });
        });
        const res = await request(app).post('/pins/expire').send({
            livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
            expirationReason: expirationReason.CallCenterPinReset,
            expiredByName: 'Test',
            expiredByUsername: 'Test',
        });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Could not find any entity of type "ActivePin" matching: {\n    "livePinId": "ca609097-7b4f-49a7-b2e9-efb78afb3ae7"\n}',
        );
    });

    test('expire PIN on generic TypeORM Error returns 422', async () => {
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new TypeORMError(
                'Could not remove ActivePin matching: {\n    livePinId: "ca609097-7b4f-49a7-b2e9-efb78afb3ae7"\n}',
            );
        });
        const res = await request(app).post('/pins/expire').send({
            livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
            expirationReason: expirationReason.CallCenterPinReset,
            expiredByName: 'Test',
            expiredByUsername: 'Test',
        });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Could not remove ActivePin matching: {\n    livePinId: "ca609097-7b4f-49a7-b2e9-efb78afb3ae7"\n}',
        );
    });

    test('expire PIN on generic error returns 500', async () => {
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new Error('An unknown error occured');
        });
        const res = await request(app).post('/pins/expire').send({
            livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
            expirationReason: expirationReason.CallCenterPinReset,
            expiredByName: 'Test',
            expiredByUsername: 'Test',
        });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('An unknown error occured');
    });
});
