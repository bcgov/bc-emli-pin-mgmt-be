import {
    DataSource,
    EntityManager,
    EntityMetadata,
    Repository,
    UpdateResult,
} from 'typeorm';
import * as ActivePIN from '../../db/ActivePIN.db';
import { ActivePINMultiResponse } from '../commonResponses';
import { expirationReason } from '../../helpers/types';
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
            'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
            expirationReason.OptOut,
            'System',
            'test',
        );
        expect(deletedPin).toBeDefined();
        expect(deletedPin?.livePinId).toBe(
            'ca609097-7b4f-49a7-b2e9-efb78afb3ae6',
        );
    });
});
