import { DataSource, EntityMetadata, Repository, UpdateResult } from 'typeorm';
import * as Users from '../../db/Users.db';
import {
    AdminPermissionResponse,
    UserDeactivateRequestBody,
    UserListSuccess,
    UserUpdateRequestBody,
    UsersMultiResponse,
} from '../commonResponses';
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

describe('Users DB tests', () => {
    test('findUser search empty select & where', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return UsersMultiResponse;
            },
        );
        const res = await Users.findUser(undefined, undefined);
        expect(res.length).toBe(2);
    });

    test(`findUser with where`, async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return [{ givenName: UsersMultiResponse[1].givenName }];
            },
        );
        const res = await Users.findUser(
            { givenName: true },
            { givenName: 'Jane' },
        );
        expect(res.length).toBe(1);
        expect(res[0].givenName).toBe('Jane');
    });

    test(`findPermissionByRole for Admin`, async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return AdminPermissionResponse;
            },
        );
        const res = await Users.findPermissionByRole('Admin');
        expect(res.length).toBe(3);
    });

    test('getUserList empty where', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return UserListSuccess;
            },
        );
        const res = await Users.getUserList();
        expect(res.length).toBe(UserListSuccess.length);
    });

    test('getUserList with where', async () => {
        jest.spyOn(Repository.prototype, 'find').mockImplementationOnce(
            async () => {
                return UserListSuccess;
            },
        );
        const res = await Users.getUserList({ isActive: true });
        expect(res.length).toBe(UserListSuccess.length);
        expect(res[0].isActive).toBe(true);
    });

    test('updateUser returns affected', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedRequest: { affected: 1 } as UpdateResult,
        });
        const res = await Users.updateUser(
            { userId: 'abcdefg' },
            { isActive: true },
            UserUpdateRequestBody,
        );
        expect(res).toBe(1);
    });

    test('updateUser returns undefined if nothing is affected', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedRequest: { affected: 0 } as UpdateResult,
        });
        const res = await Users.updateUser(
            { userId: 'abcdefg' },
            { isActive: true },
            UserUpdateRequestBody,
        );
        expect(res).toBe(undefined);
    });

    test('updateUser returns undefined if update result is undefined', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedRequest: undefined as unknown as UpdateResult,
        });
        const res = await Users.updateUser(
            { userId: 'abcdefg' },
            { isActive: true },
            UserUpdateRequestBody,
        );
        expect(res).toBe(undefined);
    });

    test('updateUser throws error if an error occured', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockImplementationOnce(
            async () => {
                throw new Error('Oops!');
            },
        );
        await expect(
            Users.updateUser(
                { userId: 'abcdefg' },
                { isActive: true },
                UserUpdateRequestBody,
            ),
        ).rejects.toThrow(`An error occured while calling updateUser: Oops!`);
    });

    test('deactivateUsers returns affected', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedUser: { affected: 1 } as UpdateResult,
        });
        const res = await Users.deactivateUsers(
            UserDeactivateRequestBody,
            'abcdefg',
        );
        expect(res).toBe(1);
    });

    test('deactivateUsers returns undefined if nothing is affected', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedUser: { affected: 0 } as UpdateResult,
        });
        const res = await Users.deactivateUsers(
            UserDeactivateRequestBody,
            'abcdefg',
        );
        expect(res).toBe(undefined);
    });

    test('deactivateUsers returns undefined if updatedUser is undefined', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockResolvedValueOnce({
            updatedUser: undefined as unknown as UpdateResult,
        });
        const res = await Users.deactivateUsers(
            UserDeactivateRequestBody,
            'abcdefg',
        );
        expect(res).toBe(undefined);
    });

    test('deactivateUsers throws error on NotFoundError', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockImplementationOnce(
            async () => {
                throw new NotFoundError('Oops!');
            },
        );
        await expect(
            Users.deactivateUsers(UserDeactivateRequestBody, 'abcdefg'),
        ).rejects.toThrow('Oops!');
    });

    test('deactivateUsers throws error on error', async () => {
        jest.spyOn(DataSource.prototype, 'transaction').mockImplementationOnce(
            async () => {
                throw new Error('Oops!');
            },
        );
        await expect(
            Users.deactivateUsers(UserDeactivateRequestBody, 'abcdefg'),
        ).rejects.toThrow(
            `An error occured while calling deactivateUsers: Oops!`,
        );
    });
});
