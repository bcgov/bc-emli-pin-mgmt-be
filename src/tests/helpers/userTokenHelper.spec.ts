import { checkActiveUser } from '../../helpers/userTokenHelper';
import * as Users from '../../db/Users.db';
import { DataSource, EntityMetadata } from 'typeorm';
import {
    SampleSuperAdminTokenPayload,
    validFindUserResponse,
} from '../commonResponses';
import { UserRoles } from '../../helpers/types';

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

describe('userTokenHelper tests', () => {
    test('checkActiveUser should work with correct query', async () => {
        jest.spyOn(Users, 'findUser').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (select?: object | undefined, where?: object | undefined) => {
                return validFindUserResponse;
            },
        );
        jest.spyOn(Users, 'findPermissionByRole').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (role: UserRoles) => {
                return SampleSuperAdminTokenPayload.permissions;
            },
        );
        const activeUser = await checkActiveUser(
            validFindUserResponse[0].userGuid,
        );
        expect(activeUser.roleType).toBe('SuperAdmin');
        expect(activeUser.permissions).toBeDefined();
        expect(activeUser.permissions?.length).toEqual(
            SampleSuperAdminTokenPayload.permissions.length,
        );
    });
    test('checkActiveUser should work with empty permission list', async () => {
        jest.spyOn(Users, 'findUser').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (select?: object | undefined, where?: object | undefined) => {
                return validFindUserResponse;
            },
        );
        jest.spyOn(Users, 'findPermissionByRole').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (role: UserRoles) => {
                return [];
            },
        );
        const activeUser = await checkActiveUser(
            validFindUserResponse[0].userGuid,
        );
        expect(activeUser.roleType).toBe('SuperAdmin');
        expect(activeUser.permissions).toBeNull();
    });
    test('checkActiveUser should work with empty user result', async () => {
        jest.spyOn(Users, 'findUser').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (select?: object | undefined, where?: object | undefined) => {
                return [];
            },
        );
        const activeUser = await checkActiveUser(
            validFindUserResponse[0].userGuid,
        );
        expect(activeUser.roleType).toBeNull();
        expect(activeUser.permissions).toBeNull();
    });

    test('checkActiveUser should throw error if findUser fails', async () => {
        jest.spyOn(Users, 'findUser').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (select?: object | undefined, where?: object | undefined) => {
                throw new Error('Unknown error');
            },
        );
        await expect(
            checkActiveUser(validFindUserResponse[0].userGuid),
        ).rejects.toThrow('Unknown error');
    });

    test('checkActiveUser should throw error if findPermissionByRole fails', async () => {
        jest.spyOn(Users, 'findUser').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (select?: object | undefined, where?: object | undefined) => {
                return validFindUserResponse;
            },
        );
        jest.spyOn(Users, 'findPermissionByRole').mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (role: UserRoles) => {
                throw new Error('Unknown error');
            },
        );
        await expect(
            checkActiveUser(validFindUserResponse[0].userGuid),
        ).rejects.toThrow('Unknown error');
    });
});
