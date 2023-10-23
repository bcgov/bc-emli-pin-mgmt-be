import { DataSource, EntityMetadata, InsertResult } from 'typeorm';
import * as AccessRequest from '../../db/AccessRequest.db';
import { AccessRequestBody } from '../commonResponses';

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

describe('Access Request DB tests', () => {
    test('createRequest successfully creates a request', async () => {
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            createdRequest: {
                identifiers: 'abcdefg',
            } as unknown as InsertResult,
        });

        const res = await AccessRequest.createRequest(AccessRequestBody);
        expect(res).toBe('abcdefg');
    });

    test(`createRequest doesn't create a request when identifiers are null`, async () => {
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            createdRequest: { identifiers: null } as unknown as InsertResult,
        });

        const res = await AccessRequest.createRequest(AccessRequestBody);
        expect(res).toBe(undefined);
    });

    test(`createRequest doesn't create a request when createdRequest is undefined`, async () => {
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            createdRequest: undefined as unknown as InsertResult,
        });

        const res = await AccessRequest.createRequest(AccessRequestBody);
        expect(res).toBe(undefined);
    });
});
