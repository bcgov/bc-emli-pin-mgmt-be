/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
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
    FindOperator,
    Like,
    TypeORMError,
} from 'typeorm';
import {
    emailPhone,
    expirationReason,
    serviceBCCreateRequestBody,
} from '../../helpers/types';
import {
    ActivePINMultiResponse,
    invalidCreatePinBodyWrongPhone,
    invalidCreatePinBodyPinLength,
    validCreatePinBodyInc,
    validCreatePinBodyNameAddLineProvLong,
    validCreatePinBodySinglePid,
    validCreatePinBodyNameAddLineProvAbbrev,
    validCreatePinBodyNameAddLineProvAbbrevLong,
    validCreatePinBodyNameAddLineProvLongOnly,
    validCreatePinBodyNameAddLineCountry,
    validCreatePinBodyNameAddLinePostalCode,
    validCreatePinBodyIncServiceBC,
    invalidCreatePinBodyPinLengthServiceBC,
    invalidCreatePinBodyWrongPhoneServiceBC,
    validCreatePinBodySinglePidServiceBC,
    invalidCreatePinBodySinglePid,
    createOrRecreatePinServiceBCSuccessResponse,
    createOrRecreatePinServiceBCFailureResponse,
    createOrRecreatePinServiceBCSuccessResponseSinglePid,
} from '../commonResponses';
import { PINController } from '../../controllers/pinController';
import { NotFoundError } from '../../helpers/NotFoundError';
import GCNotifyCaller from '../../helpers/GCNotifyCaller';
import { GCNotifyEmailSuccessResponse } from '../commonResponses';

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);
const key = 'cf430240-e5b6-4224-bd71-a02e098cc6e8'; // don't use this as the actual key...
describe('Pin endpoints', () => {
    beforeAll(() => {
        process.env.VHERS_API_KEY = key;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    /*
	  /vhers-create endpoint tests
	*/
    test('vhers-create should return a unique pin', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234|5678';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];
                if (
                    (where as any)[0].pids instanceof FindOperator &&
                    (where as any)[1].pids instanceof FindOperator
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
                requesterUsername?: string,
            ) => {
                if (updatedPins[0].pin === 'ABCD1234') return [[''], ''];
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            PINController.prototype as any,
            'createOrRecreatePin',
        ).mockResolvedValueOnce(createOrRecreatePinServiceBCSuccessResponse);

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pids).toBe('1234|5678');
    });

    test('vhers-create should return a unique pin with a singular pid', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pids instanceof FindOperator)
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
                requesterUsername?: string,
            ) => {
                if (updatedPins[0].pin === 'ABCD1234') return [[''], ''];
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            PINController.prototype as any,
            'createOrRecreatePin',
        ).mockResolvedValueOnce(
            createOrRecreatePinServiceBCSuccessResponseSinglePid,
        );

        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pids).toBe('1234');
    });

    test('vhers-create on API key not matching returns 400', async () => {
        let lastCharChange = '';
        if (key[key.length - 1] === 'f') lastCharChange = '1';
        else lastCharChange = 'f';
        const extraKey = key.substring(0, key.length - 1) + lastCharChange;
        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': extraKey });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid Token');
    });

    test('vhers-create on no API key provided returns 401', async () => {
        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app).post('/pins/vhers-create').send(reqBody);
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Access Denied');
    });

    test('vhers-create on request body validation fail returns 422', async () => {
        const reqBody = invalidCreatePinBodyWrongPhone;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Validation Error(s) occured in createPin request body:',
        );
        expect(res.body.faults[0]).toBe(
            'Phone number must be a valid, 10 digit North American phone number prefixed with 1 or +1',
        );
    });

    test('vhers-create on request body with wrong number of owners returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pids instanceof FindOperator)
                    return result as ActivePin[];
                return [];
            },
        );

        const reqBody = invalidCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234 does not match the address and name / incorporation number given:\nNone Inc. # 91011\n123 example st\nVancouver, BC, Canada V1V1V1',
        );
    });

    test('vhers-create on pin with no postal code or city returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                const result = [pin1];

                if ((where as any).pids instanceof FindOperator)
                    return result as ActivePin[];
                return [];
            },
        );

        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'No city or postal / zip code is on file for this owner: please contact service BC to create or recreate your PIN',
        );
    });

    test('vhers-create on request body on no updatable results (inc) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:' +
                `\nNone Inc. # 91011` +
                `\n123 example st` +
                `\nVancouver, BC, Canada V1V1V1`,
        );
    });

    test('vhers-create on request body on no updatable results (name) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLineProvLong;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith ` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nVancouver, Canada`,
        );
    });

    test('vhers-create on request body on no updatable results (province abbreviation) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLineProvAbbrev;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith ` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nBZ, Canada`,
        );
    });

    test('vhers-create on request body on no updatable results (country) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLineCountry;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith ` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nCanada`,
        );
    });

    test('vhers-create on request body on no updatable results (postal code) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLinePostalCode;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith ` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nV1V1V1`,
        );
    });

    test('vhers-create on request body on no updatable results (last name 2) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLineProvLong;
        reqBody.lastName_2 = 'Appleseed';
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith Appleseed ` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nVancouver, Canada`,
        );
    });

    test('vhers-create on request body on no batch update returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pids instanceof FindOperator)
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
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Error(s) occured in batchUpdatePin: ');
        expect(res.body.faults.length).toBe(1);
        expect(res.body.faults[0]).toBe(
            'An error occured while updating updatedPins[0] in batchUpdatePin: unknown error',
        );
    });

    test('vhers-create with guaranteed repeated pin returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGHf';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                (pin1.givenName = 'John'), (pin1.lastName_1 = 'Smith');
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pids instanceof FindOperator)
                    return result as ActivePin[];
                return [];
            },
        );
        const requBody = invalidCreatePinBodyPinLength;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(requBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('vhers-create pin with unknown error returns 500', async () => {
        // Without mocking things, we should get a metadata error
        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
            `No metadata for \"ActivePin\" was found.`,
        );
    });
    /*
		/create endpoint tests
	*/
    test('create should return a unique pin', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234|5678';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];
                return result as ActivePin[];
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
                requesterUsername?: string,
            ) => {
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            PINController.prototype as any,
            'createOrRecreatePinServiceBC',
        ).mockResolvedValueOnce(createOrRecreatePinServiceBCSuccessResponse);

        const reqBody = validCreatePinBodyIncServiceBC;

        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pids).toBe('1234|5678');
    });

    test('create on request body on no batch update returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];
                return result as ActivePin[];
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
                requesterUsername?: string,
            ) => {
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        const reqBody = validCreatePinBodySinglePidServiceBC;
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
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                (pin1.givenName = 'John'), (pin1.lastName_1 = 'Smith');
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];
                return result as ActivePin[];
            },
        );
        const reqBody = invalidCreatePinBodyPinLengthServiceBC;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('create on NotFoundError returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [];
            },
        );
        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Active Pin with livePinId cf430240-e5b6-4224-bd71-a02e098cc6e8 not found in database.',
        );
    });

    test('create pin with unknown error returns 500', async () => {
        // Without mocking things, we should get a metadata error
        const reqBody = validCreatePinBodySinglePidServiceBC;
        const res = await request(app).post('/pins/create').send(reqBody);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
            `No metadata for \"ActivePin\" was found.`,
        );
    });
    /*
		/vhers-regenerate endpoint tests
	*/
    test('vhers-regenerate should return a unique pin', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234|5678';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];
                if (
                    (where as any)[0].pids instanceof FindOperator &&
                    (where as any)[1].pids instanceof FindOperator
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
                requesterUsername?: string,
            ) => {
                if (updatedPins[0].pin === 'ABCD1234') return [[''], ''];
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            PINController.prototype as any,
            'createOrRecreatePin',
        ).mockResolvedValueOnce(createOrRecreatePinServiceBCSuccessResponse);

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pids).toBe('1234|5678');
    });

    test('vhers-regenerate on API key not matching returns 400', async () => {
        let lastCharChange = '';
        if (key[key.length - 1] === 'f') lastCharChange = '1';
        else lastCharChange = 'f';
        const extraKey = key.substring(0, key.length - 1) + lastCharChange;
        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody)
            .set({ 'x-api-key': extraKey });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid Token');
    });

    test('vhers-regenerate on no API key provided returns 401', async () => {
        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody);
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Access Denied');
    });

    test('vhers-regenerate on request body validation fail returns 422', async () => {
        const reqBody = invalidCreatePinBodyWrongPhone;
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Validation Error(s) occured in createPin request body:',
        );
        expect(res.body.faults[0]).toBe(
            'Phone number must be a valid, 10 digit North American phone number prefixed with 1 or +1',
        );
    });

    test('vhers-regenerate on request body on no updatable results (last name 2) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [] as ActivePin[];
            },
        );
        const reqBody = validCreatePinBodyNameAddLineProvLong;
        reqBody.lastName_2 = 'Appleseed';
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:' +
                `\nJohn Smith Appleseed ` +
                `\n123 example st` +
                `\nUnit 100A` +
                `\nVancouver, Canada`,
        );
    });

    test('vhers-regenerate with guaranteed repeated pin returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                (pin1.givenName = 'John'), (pin1.lastName_1 = 'Smith');
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];

                if ((where as any).pids instanceof FindOperator)
                    return result as ActivePin[];
                return [];
            },
        );
        const reqBody = invalidCreatePinBodyPinLength;
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('vhers-regenerate pin with unknown error returns 500', async () => {
        // Without mocking things, we should get a metadata error
        const reqBody = validCreatePinBodySinglePid;
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
            `No metadata for \"ActivePin\" was found.`,
        );
    });
    /*
		/regenerate endpoint tests
	*/
    test('regenerate should return a unique pin', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234|5678';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];
                return result as ActivePin[];
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
                requesterUsername?: string,
            ) => {
                if (updatedPins[0].pin === 'ABCD1234') return [[''], ''];
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            PINController.prototype as any,
            'pinRequestBodyValidate',
        ).mockResolvedValueOnce([]);

        jest.spyOn(
            PINController.prototype as any,
            'createOrRecreatePinServiceBC',
        ).mockResolvedValueOnce(createOrRecreatePinServiceBCSuccessResponse);

        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app).post('/pins/regenerate').send(reqBody);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pids).toBe('1234|5678');
    });

    test('regenerate on request body validation fail returns 422', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        const reqBody = invalidCreatePinBodyWrongPhoneServiceBC;
        const res = await request(app).post('/pins/regenerate').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Validation Error(s) occured in createPin request body:',
        );
        expect(res.body.faults[0]).toBe(
            'Phone number must be a valid, 10 digit North American phone number prefixed with 1 or +1',
        );
    });

    test('regenerate with guaranteed repeated pin returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                (pin1.givenName = 'John'), (pin1.lastName_1 = 'Smith');
                pin1.addressLine_1 = '123 example st';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const result = [pin1];
                return result as ActivePin[];
            },
        );
        const reqBody = invalidCreatePinBodyPinLengthServiceBC;
        const res = await request(app).post('/pins/regenerate').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('regenerate on NotFoundError returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [];
            },
        );
        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app).post('/pins/regenerate').send(reqBody);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Active Pin with livePinId cf430240-e5b6-4224-bd71-a02e098cc6e8 not found in database.',
        );
    });

    test('regenerate pin with unknown error returns 500', async () => {
        // Without mocking things, we should get a metadata error
        const reqBody = validCreatePinBodySinglePidServiceBC;
        const res = await request(app).post('/pins/regenerate').send(reqBody);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
            `No metadata for \"ActivePin\" was found.`,
        );
    });

    /*
		/initial-create endpoint tests
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
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

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

    test('expire PIN should fail without username for non-system expirations', async () => {
        const res = await request(app).post('/pins/expire').send({
            livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
            expirationReason: expirationReason.CallCenterPinReset,
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
            expiredByUsername: 'Test',
        });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('An unknown error occured');
    });

    /*
		/verify endpoint tests
	*/
    test('verify PIN should return true', async () => {
        const spy = jest
            .spyOn(ActivePIN, 'findPin')
            .mockImplementationOnce(async () => {
                return Promise.resolve([
                    ActivePINMultiResponse[0] as ActivePin,
                ]);
            });
        const res = await request(app)
            .post('/pins/verify')
            .send({
                pin: 'abcdefgh',
                pids: '1234',
            })
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.verified).toBeTruthy;
    });

    test('verify PIN on API key not matching returns 400', async () => {
        let lastCharChange = '';
        if (key[key.length - 1] === 'f') lastCharChange = '1';
        else lastCharChange = 'f';
        const extraKey = key.substring(0, key.length - 1) + lastCharChange;
        const res = await request(app)
            .post('/pins/verify')
            .send({
                pin: '12345678',
                pids: '1234',
            })
            .set({ 'x-api-key': extraKey });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid Token');
    });

    test('verify PIN on no API key provided returns 401', async () => {
        const res = await request(app).post('/pins/verify').send({
            pin: '12345678',
            pids: '1234',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Access Denied');
    });

    test('verify PIN on not matching pin error returns 403', async () => {
        const spy = jest
            .spyOn(ActivePIN, 'findPin')
            .mockImplementationOnce(async () => {
                return Promise.resolve([
                    ActivePINMultiResponse[0] as ActivePin,
                ]);
            });
        const res = await request(app)
            .post('/pins/verify')
            .send({
                pin: '12345678',
                pids: '9101112',
            })
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(403);
        expect(res.body.verified).toBeFalsy;
        expect(res.body.reason).toBeDefined();
        expect(res.body.reason.errorType).toBe('NonMatchingPidError');
        expect(res.body.reason.errorMessage).toBe('PIN and PID do not match');
    });

    test('verify PIN on not found error returns 404', async () => {
        const spy = jest
            .spyOn(ActivePIN, 'findPin')
            .mockImplementationOnce(async () => {
                return Promise.resolve([]);
            });
        const res = await request(app)
            .post('/pins/verify')
            .send({
                pin: '12345678',
                pids: '1234',
            })
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(404);
        expect(res.body.verified).toBeFalsy;
        expect(res.body.reason).toBeDefined();
        expect(res.body.reason.errorType).toBe('NotFoundError');
        expect(res.body.reason.errorMessage).toBe('PIN not found');
    });

    test('verify PIN on generic error returns 500', async () => {
        const spy = jest
            .spyOn(ActivePIN, 'findPin')
            .mockImplementationOnce(async () => {
                throw new Error('An unknown error occured');
            });
        const res = await request(app)
            .post('/pins/verify')
            .send({
                pin: '12345678',
                pids: '1234',
            })
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(500);
        expect(res.body.verified).toBeFalsy;
        expect(res.body.reason).toBeDefined();
        expect(res.body.reason.errorType).toBe('Error');
        expect(res.body.reason.errorMessage).toBe('An unknown error occured');
    });
});
