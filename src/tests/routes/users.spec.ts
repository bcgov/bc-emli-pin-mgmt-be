import { app } from '../../index';
import request from 'supertest';
import * as Users from '../../db/Users.db';
import * as auth from '../../helpers/auth';
import { DataSource, EntityMetadata, TypeORMError } from 'typeorm';
import jwt from 'jsonwebtoken';
import {
    NoPropertySearchTokenPayload,
    SampleSuperAdminTokenPayload,
    UserDeactivateRequestBody,
    UserDeactivateRequestBodyNoId,
    UserListSuccess,
    UserListSuccessDeactivated,
    updateUserExistingUser,
    updateUserRequestBody,
} from '../commonResponses';
import { NotFoundError } from '../../helpers/NotFoundError';

jest.spyOn(DataSource.prototype, 'getMetadata').mockImplementation(
    () => ({}) as EntityMetadata,
);

let token: string | null;
describe('User endpoints', () => {
    beforeAll(() => {
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
		GET /users endpoint tests
	*/
    test('GET users should return a list of active users', async () => {
        jest.spyOn(Users, 'getUserList').mockResolvedValueOnce(UserListSuccess);
        const res = await request(app)
            .get('/users?active=true')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(UserListSuccess.length);
    });

    test('GET users should return a list of deactivated users', async () => {
        jest.spyOn(Users, 'getUserList').mockResolvedValueOnce(
            UserListSuccessDeactivated,
        );
        const res = await request(app)
            .get('/users?active=false')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(UserListSuccess.length);
    });

    test('GET users should return 204 on no results', async () => {
        jest.spyOn(Users, 'getUserList').mockResolvedValueOnce([]);
        const res = await request(app)
            .get('/users?active=true')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(204);
    });

    test('GET users should return 403 on no user access', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(NoPropertySearchTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const res = await request(app)
            .get('/users?active=true')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            `Permission 'USER_ACCESS' is not available for the user ${NoPropertySearchTokenPayload.username}`,
        );
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('GET users should return 404 on generic authentication error', async () => {
        jest.spyOn(auth, 'decodingJWT').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const res = await request(app)
            .get('/users?active=true')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe(`Oops!`);
    });

    test('GET users should return 422 on TypeORM error', async () => {
        jest.spyOn(Users, 'getUserList').mockImplementationOnce(() => {
            throw new TypeORMError('Oops!');
        });
        const res = await request(app)
            .get('/users?active=true')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Oops!');
    });

    test('GET users should return 500 on unknown error', async () => {
        jest.spyOn(Users, 'getUserList').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const res = await request(app)
            .get('/users?active=true')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Oops!');
    });

    /*
		PUT /users endpoint tests
	*/
    test('PUT users should return 204 on success', async () => {
        jest.spyOn(Users, 'findUser').mockResolvedValueOnce(
            updateUserExistingUser,
        );
        jest.spyOn(Users, 'updateUser').mockResolvedValueOnce(1);
        const reqBody = updateUserRequestBody;
        const res = await request(app)
            .put('/users')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(204);
    });

    test('PUT users should return 403 on no user access', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(NoPropertySearchTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const reqBody = updateUserRequestBody;
        const res = await request(app)
            .put('/users')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            `Permission 'USER_ACCESS' is not available for the user ${NoPropertySearchTokenPayload.username}`,
        );
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('PUT users should return 404 on generic authentication error', async () => {
        jest.spyOn(auth, 'decodingJWT').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const reqBody = updateUserRequestBody;
        const res = await request(app)
            .put('/users')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe(`Oops!`);
    });

    test('PUT users should return 422 on no matching user', async () => {
        jest.spyOn(Users, 'findUser').mockResolvedValueOnce([]);
        const reqBody = updateUserRequestBody;
        const res = await request(app)
            .put('/users')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            `User with userId ${updateUserRequestBody.userId} not found in database`,
        );
    });

    test('PUT users should return 500 on unknown error', async () => {
        jest.spyOn(Users, 'findUser').mockResolvedValueOnce(
            updateUserExistingUser,
        );
        jest.spyOn(Users, 'updateUser').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const reqBody = updateUserRequestBody;
        const res = await request(app)
            .put('/users')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Oops!');
    });

    /*
		/users/deactivate endpoint tests
	*/
    test('/users/deactivate should return 204 on success', async () => {
        jest.spyOn(Users, 'deactivateUsers').mockResolvedValueOnce(1);
        const reqBody = UserDeactivateRequestBody;
        const res = await request(app)
            .put('/users/deactivate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(204);
    });

    test('/users/deactivate should return 403 on no user access', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(NoPropertySearchTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const reqBody = UserDeactivateRequestBody;
        const res = await request(app)
            .put('/users/deactivate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            `Permission 'USER_ACCESS' is not available for the user ${NoPropertySearchTokenPayload.username}`,
        );
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('/users/deactivate should return 404 on generic authentication error', async () => {
        jest.spyOn(auth, 'decodingJWT').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const reqBody = UserDeactivateRequestBody;
        const res = await request(app)
            .put('/users/deactivate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe(`Oops!`);
    });

    test('/users/deactivate should return 404 on deactivateUsers not found', async () => {
        jest.spyOn(Users, 'deactivateUsers').mockImplementationOnce(() => {
            throw new NotFoundError('Not found');
        });
        const reqBody = UserDeactivateRequestBody;
        const res = await request(app)
            .put('/users/deactivate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Not found');
    });

    test('/users/deactivate should return 422 on no user id provided', async () => {
        const reqBody = UserDeactivateRequestBodyNoId;
        const res = await request(app)
            .put('/users/deactivate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Must provide at least one user id');
    });

    test('/users/deactivate should return 422 on deactivateUsers typeORM error', async () => {
        jest.spyOn(Users, 'deactivateUsers').mockImplementationOnce(() => {
            throw new TypeORMError('Oops!');
        });
        const reqBody = UserDeactivateRequestBody;
        const res = await request(app)
            .put('/users/deactivate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Oops!');
    });

    test('/users/deactivate should return 500 on deactivateUsers unknown error', async () => {
        jest.spyOn(Users, 'deactivateUsers').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const reqBody = UserDeactivateRequestBody;
        const res = await request(app)
            .put('/users/deactivate')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Oops!');
    });
});
