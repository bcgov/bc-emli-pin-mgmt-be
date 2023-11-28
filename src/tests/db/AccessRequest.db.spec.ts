import { DataSource, EntityMetadata, InsertResult, Repository } from 'typeorm';
import * as AccessRequest from '../../db/AccessRequest.db';
import {
    AccessRequestBody,
    AccessRequestUpdateRequestBody,
    UserRequestPendingResponse,
    ValidUpdateAccessRequestBody,
} from '../commonResponses';
import { UpdateResult } from 'typeorm/browser';
import { NotFoundError } from '../../helpers/NotFoundError';

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

    test('updateRequestStatus successfully updates a request', async () => {
        /*
         * Unfortunately, because the other typeORM calls are wrapped in a transaction, I have to
         * mock the whole thing and not the individual db calls within it.
         */
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedRequest: { affected: 1 } as UpdateResult,
        });
        const res = await AccessRequest.updateRequestStatus(
            AccessRequestUpdateRequestBody,
            'abcdef',
        );
        expect(res).toBe(1);
    });

    test(`updateRequestStatus doesn't update a request when a NotFoundError is thrown`, async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockImplementationOnce(
            () => {
                throw new NotFoundError('Oops!');
            },
        );
        await expect(
            AccessRequest.updateRequestStatus(
                ValidUpdateAccessRequestBody,
                'abcdef',
            ),
        ).rejects.toThrow(`Oops!`);
    });

    test(`updateRequestStatus doesn't update a request when an error is thrown`, async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockImplementationOnce(
            () => {
                throw new Error('Oops!');
            },
        );
        await expect(
            AccessRequest.updateRequestStatus(
                AccessRequestUpdateRequestBody,
                'abcdef',
            ),
        ).rejects.toThrow(
            `An error occured while calling updateRequestStatus: Oops!`,
        );
    });

    test(`updateRequestStatus doesn't update a request when updatedRequest affected is 0`, async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedRequest: { affected: 0 } as UpdateResult,
        });
        const res = await AccessRequest.updateRequestStatus(
            AccessRequestUpdateRequestBody,
            'abcdef',
        );
        expect(res).toBe(undefined);
    });

    test(`updateRequestStatus doesn't update a request when updatedRequest is undefined`, async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedRequest: undefined as unknown as UpdateResult,
        });
        const res = await AccessRequest.updateRequestStatus(
            AccessRequestUpdateRequestBody,
            'abcdef',
        );
        expect(res).toBe(undefined);
    });

    test('getRequestList successfully returns a list of requests', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return Promise.resolve(UserRequestPendingResponse);
            },
        );
        const res = await AccessRequest.getRequestList();
        expect(res.length).toBe(UserRequestPendingResponse.length);
    });

    test('getRequestList successfully returns a list of requests with where clause', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return Promise.resolve(UserRequestPendingResponse);
            },
        );
        const res = await AccessRequest.getRequestList({
            requestStatus: 'NotGranted',
        });
        expect(res.length).toBe(UserRequestPendingResponse.length);
        expect(res[0].requestStatus).toBe('NotGranted');
    });
});
