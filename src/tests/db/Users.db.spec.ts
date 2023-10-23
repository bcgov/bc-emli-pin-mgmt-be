import { DataSource, EntityMetadata, Repository } from 'typeorm';
import * as Users from '../../db/Users.db';
import {
    AdminPermissionResponse,
    UsersMultiResponse,
} from '../commonResponses';

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
});
