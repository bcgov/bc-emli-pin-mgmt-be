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
    createPinRequestBody,
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
    createOrRecreatePinServiceBCSuccessResponseSinglePid,
    SampleSuperAdminTokenPayload,
    DeletePINSuccessResponse,
    weightsThresholds,
    NamelessTokenPayload,
    SampleBCEIDBUsinessAdminTokenPayload,
    LastNameOnlyTokenPayload,
} from '../commonResponses';
import { PINController } from '../../controllers/pinController';
import jwt from 'jsonwebtoken';
import * as auth from '../../helpers/auth';
import { AuthenticationError } from '../../middleware/AuthenticationError';

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);
const key = 'cf430240-e5b6-4224-bd71-a02e098cc6e8'; // don't use this as the actual key...
let token: string | null;
describe('Pin endpoints', () => {
    beforeAll(() => {
        process.env.VHERS_API_KEY = key;
        const JWT_SECRET = 'abcd';
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
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
        jest.spyOn(ActivePIN, 'singleUpdatePin').mockImplementationOnce(
            async (
                updatedPins: ActivePin,
                sendToInfo: emailPhone,
                propertyAddress: string,
                requesterUsername?: string,
                requesterName?: string,
            ) => {
                return [[], 'create'];
            },
        );

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
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
                const pin2 = new ActivePin();
                pin2.pids = '1234';
                pin2.titleNumber = 'EFGH';
                pin2.landTitleDistrict = 'BC';
                pin2.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin2.lastName_1 = 'None';
                pin2.incorporationNumber = '91011';
                pin2.addressLine_1 = '123 example s';
                pin2.city = 'Vancouver';
                pin2.provinceAbbreviation = 'BC';
                pin2.country = 'Canada';
                pin2.postalCode = 'V1V1V1';
                const result = [pin2, pin1];

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
        jest.spyOn(ActivePIN, 'singleUpdatePin').mockImplementationOnce(
            async (
                updatedPins: ActivePin,
                sendToInfo: emailPhone,
                requesterUsername?: string,
            ) => {
                if (updatedPins.pin === 'ABCD1234') return [[], 'recreate'];
                return [
                    [
                        `An error occured while updating updatedPin in singleUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        const reqBody = validCreatePinBodySinglePid;
        reqBody.numberOfOwners = 2;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pids).toBe('1234');
        reqBody.numberOfOwners = 1;
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

    test('vhers-create on borderline result (address) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234|5678';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91011';
                pin1.addressLine_1 = '123 exam blvd';
                pin1.city = 'Vancouver';
                pin1.provinceAbbreviation = 'BC';
                pin1.country = 'Canada';
                pin1.postalCode = 'V1V1V1';
                const pin2 = new ActivePin();
                pin2.pids = '1234';
                pin2.titleNumber = 'EFGH';
                pin2.landTitleDistrict = 'BC';
                pin2.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin2.lastName_1 = 'None';
                pin2.incorporationNumber = '91011';
                pin2.addressLine_1 = '123 e blvd';
                pin2.city = 'Vancouver';
                pin2.provinceAbbreviation = 'BC';
                pin2.country = 'Canada';
                pin2.postalCode = 'V1V1V1';
                const result = [pin2, pin1];
                if (
                    (where as any)[0].pids instanceof FindOperator &&
                    (where as any)[1].pids instanceof FindOperator
                )
                    return result as ActivePin[];
                return [];
            },
        );
        jest.spyOn(PINController.prototype as any, 'dynamicImportCaller')
            .mockImplementationOnce(() => {
                return weightsThresholds;
            })
            .mockImplementationOnce(() => {
                return weightsThresholds;
            })
            .mockImplementationOnce(() => {
                return weightsThresholds;
            });

        const reqBody = validCreatePinBodyInc;
        reqBody.numberOfOwners = 2;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Close result: consider checking your address',
        );
        reqBody.numberOfOwners = 1;
    });

    test('vhers-create on borderline result (postal code) returns 422', async () => {
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
                pin1.postalCode = 'V1V1V2';
                const result = [pin1];
                if (
                    (where as any)[0].pids instanceof FindOperator &&
                    (where as any)[1].pids instanceof FindOperator
                )
                    return result as ActivePin[];
                return [];
            },
        );
        jest.spyOn(PINController.prototype as any, 'dynamicImportCaller')
            .mockImplementationOnce(() => {
                return weightsThresholds;
            })
            .mockImplementationOnce(() => {
                return weightsThresholds;
            });

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Close result: consider checking your postal code',
        );
    });

    test('vhers-create on borderline result (postal code) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234|5678';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'None';
                pin1.incorporationNumber = '91015';
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
        jest.spyOn(PINController.prototype as any, 'dynamicImportCaller')
            .mockImplementationOnce(() => {
                return weightsThresholds;
            })
            .mockImplementationOnce(() => {
                return weightsThresholds;
            });

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Close result: consider checking your incorporation number',
        );
    });

    test('vhers-create on borderline result (postal code) returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                const pin1 = new ActivePin();
                pin1.pids = '1234|5678';
                pin1.titleNumber = 'EFGH';
                pin1.landTitleDistrict = 'BC';
                pin1.livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
                pin1.lastName_1 = 'Incorrect name';
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
        jest.spyOn(PINController.prototype as any, 'dynamicImportCaller')
            .mockImplementationOnce(() => {
                return weightsThresholds;
            })
            .mockImplementationOnce(() => {
                return weightsThresholds;
            });

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-create')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Close result: consider checking your name',
        );
    });

    test('vhers-create on no update returns 422', async () => {
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
        jest.spyOn(ActivePIN, 'singleUpdatePin').mockImplementationOnce(
            async (
                updatedPins: ActivePin,
                sendToInfo: emailPhone,
                propertyAddress: string,
                requesterUsername?: string,
                requesterName?: string,
            ) => {
                return [
                    [
                        `An error occured while updating updatedPin in singleUpdatePin: unknown error`,
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
        expect(res.body.message).toBe('Error(s) occured in singleUpdatePin: ');
        expect(res.body.faults.length).toBe(1);
        expect(res.body.faults[0]).toBe(
            'An error occured while updating updatedPin in singleUpdatePin: unknown error',
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
                return [[], 'create'];
            },
        );

        const reqBody = validCreatePinBodyIncServiceBC;

        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pids).toBe('1234|5678');
    });

    test('create should not return pin for admin', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(SampleBCEIDBUsinessAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
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
                propertyAddress: string,
                requesterUsername?: string,
                requesterName?: string,
            ) => {
                return [[], 'create'];
            },
        );

        const reqBody = validCreatePinBodyIncServiceBC;

        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pids).toBe('1234|5678');
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('create on JWT error returns 403', async () => {
        jest.spyOn(auth, 'decodingJWT').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Unable to decode JWT');
    });

    test('create on blank name and username returns 403', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(NamelessTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            `Username or given / family name does not exist for requester`,
        );
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('create on no first name and username returns 403', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(LastNameOnlyTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            `Username or given / family name does not exist for requester`,
        );
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
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
                propertyAddress: string,
                requesterUsername?: string,
                requesterName?: string,
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
        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
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
        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
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
        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Active Pin with livePinId cf430240-e5b6-4224-bd71-a02e098cc6e8 not found in database.',
        );
    });

    test('create pin with unknown error returns 500', async () => {
        // Without mocking things, we should get a metadata error
        const reqBody = validCreatePinBodySinglePidServiceBC;
        const res = await request(app)
            .post('/pins/create')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
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
        jest.spyOn(ActivePIN, 'singleUpdatePin').mockImplementationOnce(
            async (
                updatedPins: ActivePin,
                sendToInfo: emailPhone,
                requesterUsername?: string,
            ) => {
                if (updatedPins.pin === 'ABCD1234') return [[], ''];
                return [
                    [
                        `An error occured while updating updatedPin in singleUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/vhers-regenerate')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
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
                propertyAddress: string,
                requesterUsername?: string,
                requesterName?: string,
            ) => {
                if (updatedPins[0].pin === 'ABCD1234') return [[], ''];
                return [
                    [
                        `An error occured while updating updatedPins[0] in batchUpdatePin: unknown error`,
                    ],
                    `create`,
                ];
            },
        );

        jest.spyOn(
            PINController.prototype as any,
            'pinRequestBodyValidate',
        ).mockResolvedValueOnce([]);

        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app)
            .post('/pins/regenerate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].pin).toBe('ABCD1234');
        expect(res.body[0].pids).toBe('1234|5678');
    });

    test('regenerate on authentication error returns 403', async () => {
        jest.spyOn(
            PINController.prototype as any,
            'createOrRecreatePinServiceBC',
        ).mockImplementationOnce(async () => {
            throw new AuthenticationError('Auth error', 403);
        });
        const reqBody = validCreatePinBodyIncServiceBC;
        const res = await request(app)
            .post('/pins/regenerate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Auth error');
    });

    test('regenerate on request body validation fail returns 422', async () => {
        const reqBody = invalidCreatePinBodyWrongPhoneServiceBC;
        const res = await request(app)
            .post('/pins/regenerate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
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
        const res = await request(app)
            .post('/pins/regenerate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
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
        const res = await request(app)
            .post('/pins/regenerate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Active Pin with livePinId cf430240-e5b6-4224-bd71-a02e098cc6e8 not found in database.',
        );
    });

    test('regenerate pin with unknown error returns 500', async () => {
        // Without mocking things, we should get a metadata error
        const reqBody = validCreatePinBodySinglePidServiceBC;
        const res = await request(app)
            .post('/pins/regenerate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
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
            .query({ quantity: 2 })
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.pins.length).toBe(2);
        expect(res.body.pins[0]).not.toEqual(res.body.pins[1]);
    });

    test('initial create with too few pins returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 0 })
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'The number of PINS created must be greater than 0.',
        );
    });

    test('initial create with guaranteed repeated pin returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 9, pinLength: 3, allowedChars: 'AB' })
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Quantity of PINs requested too high: guaranteed repeats for the given pin length and character set.',
        );
    });

    test('initial create too short PIN (length < 1) returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 1, pinLength: 0 })
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('PIN must be of length 1 or greater');
    });

    test('initial create PIN with no characters in set returns default character set pin', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .query({ quantity: 1, allowedChars: '' })
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.pins.length).toBe(1);
        expect(res.body.pins[0].length).toEqual(8);
    });

    test('initial create PIN with no quantity returns 422', async () => {
        const res = await request(app)
            .get('/pins/initial-create')
            .set('Cookie', `token=${token}`)
            .send();
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
            .query({ quantity: 1 })
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('An unknown error occurred');
    });

    /* 
		/expire endpoint tests 
	*/
    test('expire PIN should return expired PIN', async () => {
        jest.spyOn(
            PINController.prototype as any,
            'pinRequestBodyValidate',
        ).mockResolvedValueOnce([]);

        jest.spyOn(ActivePIN as any, 'deletePin').mockResolvedValueOnce(
            DeletePINSuccessResponse,
        );

        const res = await request(app)
            .post('/pins/expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
                expirationReason: expirationReason.ChangeOfOwnership,
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set('Cookie', `token=${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.livePinId).toBe('ca609097-7b4f-49a7-b2e9-efb78afb3ae6');
    });

    test('expire PIN should fail without username for non-system expirations', async () => {
        const res = await request(app)
            .post('/pins/expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
                expirationReason: expirationReason.CallCenterPinReset,
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Must provide an expiration username when expiring a PIN',
        );
    });

    test('expire PIN should fail without email or phone for non-system expirations', async () => {
        const res = await request(app)
            .post('/pins/expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
                expirationReason: expirationReason.CallCenterPinReset,
                propertyAddress: '123 example st',
                expiredByUsername: 'jsmith',
            })
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'An email and/or phone number must be provided for non-system PIN expiration',
        );
    });

    test('expire PIN should fail without property address for non-system expirations', async () => {
        const res = await request(app)
            .post('/pins/expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
                expirationReason: expirationReason.CallCenterPinReset,
                email: '123 example st',
                expiredByUsername: 'jsmith',
            })
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Property address must be provided for non-system PIN expiration',
        );
    });

    test('expire PIN without existing PIN returns 422', async () => {
        jest.clearAllMocks();
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new EntityNotFoundError(ActivePin, {
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            });
        });
        const res = await request(app)
            .post('/pins/expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                expirationReason: expirationReason.CallCenterPinReset,
                expiredByUsername: 'Test',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            `Could not find any entity of type "ActivePin" matching: {\n    "livePinId": "ca609097-7b4f-49a7-b2e9-efb78afb3ae7",\n    "propertyAddress": "123 example st",\n    "email": "test@gmail.com"\n}`,
        );
    });

    test('expire PIN on generic TypeORM Error returns 422', async () => {
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new TypeORMError(
                'Could not remove ActivePin matching: {\n    livePinId: "ca609097-7b4f-49a7-b2e9-efb78afb3ae7"\n}',
            );
        });
        const res = await request(app)
            .post('/pins/expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                expirationReason: expirationReason.CallCenterPinReset,
                expiredByUsername: 'Test',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Could not remove ActivePin matching: {\n    livePinId: "ca609097-7b4f-49a7-b2e9-efb78afb3ae7"\n}',
        );
    });

    test('expire PIN on generic error returns 500', async () => {
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new Error('An unknown error occured');
        });
        const res = await request(app)
            .post('/pins/expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                expirationReason: expirationReason.CallCenterPinReset,
                expiredByUsername: 'Test',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('An unknown error occured');
    });

    /* 
		/etl-expire endpoint tests 
	*/
    test('etl-expire PIN should return expired PIN', async () => {
        jest.spyOn(
            PINController.prototype as any,
            'pinRequestBodyValidate',
        ).mockResolvedValueOnce([]);

        jest.spyOn(ActivePIN as any, 'deletePin').mockResolvedValueOnce(
            DeletePINSuccessResponse,
        );

        const res = await request(app)
            .post('/pins/etl-expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
                expirationReason: expirationReason.ChangeOfOwnership,
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set({ 'x-api-key': key });

        expect(res.statusCode).toBe(200);
        expect(res.body.livePinId).toBe('ca609097-7b4f-49a7-b2e9-efb78afb3ae6');
    });

    test('etl-expire PIN should fail without username for non-system expirations', async () => {
        const res = await request(app)
            .post('/pins/etl-expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
                expirationReason: expirationReason.CallCenterPinReset,
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Must provide an expiration username when expiring a PIN',
        );
    });

    test('etl-expire PIN without existing PIN returns 422', async () => {
        jest.clearAllMocks();
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new EntityNotFoundError(ActivePin, {
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            });
        });
        const res = await request(app)
            .post('/pins/etl-expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                expirationReason: expirationReason.CallCenterPinReset,
                expiredByUsername: 'Test',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            `Could not find any entity of type "ActivePin" matching: {\n    "livePinId": "ca609097-7b4f-49a7-b2e9-efb78afb3ae7",\n    "propertyAddress": "123 example st",\n    "email": "test@gmail.com"\n}`,
        );
    });

    test('etl-expire PIN on generic TypeORM Error returns 422', async () => {
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new TypeORMError(
                'Could not remove ActivePin matching: {\n    livePinId: "ca609097-7b4f-49a7-b2e9-efb78afb3ae7"\n}',
            );
        });
        const res = await request(app)
            .post('/pins/etl-expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                expirationReason: expirationReason.CallCenterPinReset,
                expiredByUsername: 'Test',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Could not remove ActivePin matching: {\n    livePinId: "ca609097-7b4f-49a7-b2e9-efb78afb3ae7"\n}',
        );
    });

    test('etl-expire PIN on generic error returns 500', async () => {
        jest.spyOn(ActivePIN, 'deletePin').mockImplementationOnce(async () => {
            throw new Error('An unknown error occured');
        });
        const res = await request(app)
            .post('/pins/etl-expire')
            .send({
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae7',
                expirationReason: expirationReason.CallCenterPinReset,
                expiredByUsername: 'Test',
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            })
            .set({ 'x-api-key': key });
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
        expect(res.body.livePinId).toEqual(ActivePINMultiResponse[0].livePinId);
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

    test('verify PIN on not matching pin error returns 418', async () => {
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
        expect(res.statusCode).toBe(418);
        expect(res.body.verified).toBeFalsy;
        expect(res.body.reason).toBeDefined();
        expect(res.body.reason.errorType).toBe('NonMatchingPidError');
        expect(res.body.reason.errorMessage).toBe('PIN and PID do not match');
    });

    test('verify PIN on not found error returns 410', async () => {
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
        expect(res.statusCode).toBe(410);
        expect(res.body.verified).toBeFalsy;
        expect(res.body.reason).toBeDefined();
        expect(res.body.reason.errorType).toBe('NotFoundError');
        expect(res.body.reason.errorMessage).toBe(
            'PIN was unable to be verified',
        );
    });

    test('verify PIN on generic error returns 408', async () => {
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
        expect(res.statusCode).toBe(408);
        expect(res.body.verified).toBeFalsy;
        expect(res.body.reason).toBeDefined();
        expect(res.body.reason.errorType).toBe('Error');
        expect(res.body.reason.errorMessage).toBe('An unknown error occured');
    });

    /* 
		/thresholds endpoint tests 
	*/
    test('thresholds displays the thresholds and weights', async () => {
        const res = await request(app)
            .get('/pins/thresholds')
            .set({ 'x-api-key': key });
        expect(res.body.thresholds).toBeDefined();
        expect(res.body.weights).toBeDefined();
    });

    test('thresholds on any error returns 500', async () => {
        jest.spyOn(PINController.prototype as any, 'dynamicImportCaller')
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(() => {
                throw new Error('Missing required fields in import');
            });
        const res = await request(app)
            .get('/pins/thresholds')
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
            'Error in weightsThresholds: failed to grab thresholds',
        );
    });

    /* 
		/score endpoint tests 
	*/
    test('score returns an address score with valid query', async () => {
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

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/score')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(200);
        expect(res.body.ActivePin).toBeDefined();
        expect(res.body.matchScore).toBeDefined();
    });

    test('score with no matches returns 422', async () => {
        jest.spyOn(ActivePIN, 'findPin').mockImplementationOnce(
            async (select?: object | undefined, where?: object | undefined) => {
                return [];
            },
        );

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/score')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Pids 1234|5678 does not match the address and name / incorporation number given:\n' +
                'None Inc. # 91011\n' +
                '123 example st\n' +
                'Vancouver, BC, Canada V1V1V1',
        );
    });

    test('score with aggregate error returns 422', async () => {
        jest.spyOn(
            PINController.prototype as any,
            'addressScoreRank',
        ).mockImplementationOnce(async () => {
            throw new AggregateError(['error 1'], 'errors occured');
        });

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/score')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('errors occured');
        expect(res.body.faults.length).toEqual(1);
        expect(res.body.faults[0]).toBe('error 1');
    });

    test('score with range error returns 422', async () => {
        jest.spyOn(
            PINController.prototype as any,
            'addressScoreRank',
        ).mockImplementationOnce(async () => {
            throw new RangeError('error occured');
        });

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/score')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('error occured');
    });

    test('score with unknown error returns 500', async () => {
        jest.spyOn(
            PINController.prototype as any,
            'addressScoreRank',
        ).mockImplementationOnce(async () => {
            throw new Error('error occured');
        });

        const reqBody = validCreatePinBodyInc;
        const res = await request(app)
            .post('/pins/score')
            .send(reqBody)
            .set({ 'x-api-key': key });
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('error occured');
    });
});
