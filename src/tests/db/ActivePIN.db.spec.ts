import {
    DataSource,
    EntityManager,
    EntityMetadata,
    Repository,
    UpdateResult,
} from 'typeorm';
import * as ActivePIN from '../../db/ActivePIN.db';
import {
    ActivePINMultiResponse,
    ActivePINResponseNoPIN,
    ActivePINResponseWithPIN,
} from '../commonResponses';
import { expirationReason, roleType } from '../../helpers/types';
import { ActivePin } from '../../entity/ActivePin';

// mock out db
jest.mock('typeorm', () => {
    const actual = jest.requireActual('typeorm');
    return {
        ...actual,
        getRepository: jest.fn(),
    };
});

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

jest.spyOn(EntityManager.prototype, 'remove').mockImplementation(async () => {
    return [];
});

describe('Active PIN db tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    test('findPin search empty select & where', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return ActivePINMultiResponse;
            },
        );
        const res = await ActivePIN.findPin();
        expect(res.length).toEqual(2);
        expect(res[0].livePinId).toBe('ca609097-7b4f-49a7-b2e9-efb78afb3ae6');
        expect(res[1].livePinId).toBe('5df6bad9-09bc-4d50-8f76-19cf503b41ab');
    });

    test('findPin search select and where', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                const array = [];
                array.push({
                    livePinId: ActivePINMultiResponse[0].livePinId,
                    pin: ActivePINMultiResponse[0].pin,
                });
                return array;
            },
        );
        const res = await ActivePIN.findPin(
            { livePinId: true, pin: true },
            { livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6' },
        );
        expect(res.length).toEqual(1);
        expect(res[0].livePinId).toBe('ca609097-7b4f-49a7-b2e9-efb78afb3ae6');
        expect(res[0].pin).toBe('abcdefgh');
        expect(res[0].updatedAt).not.toBeDefined();
    });

    test('deletePin succesfully returns the deleted pin', async () => {
        const logInfo = { affected: 1 } as UpdateResult;
        const returnValue = {
            PINToDelete: ActivePINMultiResponse[0] as ActivePin,
            logInfo: logInfo,
        };
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         * Fortunately, these are all functions that I would have to mock out anyway, so it's not a big deal.
         * It just means that it's not possible to get full code coverage of the lines within the transaction.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce(
            returnValue,
        );
        const deletedPin = await ActivePIN.deletePin(
            {
                livePinId: 'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
                expirationReason: expirationReason.ChangeOfOwnership,
                propertyAddress: '123 example st',
                email: 'test@gmail.com',
            },
            'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
            expirationReason.OptOut,
            'test',
        );
        expect(deletedPin).toBeDefined();
        expect(deletedPin?.livePinId).toBe(
            'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
        );
    });

    test('batchUpdatePin returns updated pins with no requester name or username', async () => {
        const logInfo = { affected: 1 } as UpdateResult;
        const regenerateOrCreate = 'create' as string;
        const returnValue = [logInfo, regenerateOrCreate];
        const pins: ActivePin[] = [new ActivePin()];
        pins[0].livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
        const emailPhone = { email: 'email@example.com' };
        const propertyAddress = '123 Example St';
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce(
            returnValue,
        );
        const response = await ActivePIN.batchUpdatePin(
            pins,
            emailPhone,
            propertyAddress,
        );
        expect(response[0].length).toBe(0);
    });

    test('batchUpdatePin returns updated pins with requester name and username', async () => {
        const logInfo = { affected: 1 } as UpdateResult;
        const regenerateOrCreate = 'create' as string;
        const returnValue = [logInfo, regenerateOrCreate];
        const pins: ActivePin[] = [new ActivePin()];
        pins[0].livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
        const emailPhone = { email: 'email@example.com' };
        const requesterUsername = 'jsmith';
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce(
            returnValue,
        );
        const response = await ActivePIN.batchUpdatePin(
            pins,
            emailPhone,
            requesterUsername,
        );
        expect(response[0].length).toBe(0);
    });

    test(`batchUpdatePin returns error when there's an error in the transaction`, async () => {
        const pins: ActivePin[] = [new ActivePin()];
        pins[0].livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
        const emailPhone = { email: 'email@example.com' };
        const requesterUsername = 'jsmith';
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockImplementationOnce(
            async () => {
                throw new Error('An unknown error occurred');
            },
        );
        const response = await ActivePIN.batchUpdatePin(
            pins,
            emailPhone,
            requesterUsername,
        );
        expect(response[0].length).toBe(1);
        expect(response[0][0]).toBe(
            'An error occured while updating updatedPins[0] in batchUpdatePin: An unknown error occurred',
        );
    });

    test('batchUpdatePin returns error when no rows were affected', async () => {
        const logInfo = { affected: 0 } as UpdateResult;
        const returnValue = {
            logInfo: logInfo,
        };
        const pins: ActivePin[] = [new ActivePin()];
        pins[0].livePinId = 'cf430240-e5b6-4224-bd71-a02e098cc6e8';
        const emailPhone = { email: 'email@example.com' };
        const propertyAddress = '123 Example St';
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce(
            returnValue,
        );
        const response = await ActivePIN.batchUpdatePin(
            pins,
            emailPhone,
            propertyAddress,
        );
        expect(response[0].length).toBe(1);
        expect(response[0][0]).toBe(
            'An error occured while updating updatedPins[0] in batchUpdatePin: No rows were affected by the update',
        );
    });

    test('findPropertyDetails returns property details with pin for SuperAdmin', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return [ActivePINResponseWithPIN];
            },
        );
        const res = await ActivePIN.findPropertyDetails(
            ['9765107'],
            roleType.SuperAdmin,
        );
        expect(res[0].pin).toBeDefined();
    });

    test('findPropertyDetails returns property details without pin for Admin', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return [ActivePINResponseNoPIN];
            },
        );
        const res = await ActivePIN.findPropertyDetails(
            ['9765107', '000000'],
            roleType.Admin,
        );
        expect(res[0].pin).not.toBeDefined();
    });
});
