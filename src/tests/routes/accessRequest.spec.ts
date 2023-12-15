/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
import * as AccessRequest from '../../db/AccessRequest.db';
import GCNotifyCaller from '../../helpers/GCNotifyCaller';
import {
    AccessRequestPostNoOrgIdir,
    AccessRequestPostNoReason,
    AccessRequestValidBody,
    GCNotifyEmailSuccessResponse,
    NoPropertySearchTokenPayload,
    NoRolePayload,
    SampleSuperAdminTokenPayload,
    UpdateAccessRequestBodyNoIds,
    UpdateAccessRequestBodyNoReason,
    UserRequestCompletedResponse,
    UserRequestPendingResponse,
    ValidUpdateAccessRequestBody,
} from '../commonResponses';
import { AccessRequestController } from '../../controllers/AccessRequestController';
import { TsoaResponse } from 'tsoa';
import {
    DuplicateRequestErrorType,
    GenericTypeORMErrorType,
    InvalidTokenErrorResponse,
    UnauthorizedErrorResponse,
    requiredFieldErrorType,
    serverErrorType,
} from '../../helpers/types';
import { app } from '../../index';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { TypeORMError } from 'typeorm';
import * as auth from '../../helpers/auth';
import { NotFoundError } from '../../helpers/NotFoundError';

describe('Access Request endpoints', () => {
    let proto: { createAccessRequest: () => void },
        controller: AccessRequestController,
        token: string | null,
        noRoleToken: string | null;
    beforeAll(() => {
        controller = new AccessRequestController();
        proto = Object.getPrototypeOf(controller);
        const JWT_SECRET = 'abcd';
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        noRoleToken = jwt.sign(NoRolePayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    /*
		POST /user-requests endpoint tests
	*/
    test('Run createAccessRequest successfully', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(AccessRequest, 'createRequest').mockResolvedValueOnce({
            createdRequest: {
                identifiers: '123',
            },
        });
        jest.spyOn(AccessRequest, 'getRequestList').mockResolvedValueOnce([]);

        const reqBody = AccessRequestValidBody;
        const res:
            | TsoaResponse<400, InvalidTokenErrorResponse>
            | TsoaResponse<401, UnauthorizedErrorResponse>
            | TsoaResponse<409, DuplicateRequestErrorType>
            | TsoaResponse<422, GenericTypeORMErrorType>
            | TsoaResponse<422, requiredFieldErrorType>
            | TsoaResponse<500, serverErrorType>
            | undefined = await (proto as any).createAccessRequest(
            () => {},
            () => {},
            () => {},
            () => {},
            () => {},
            () => {},
            () => {},
            reqBody,
        );
        expect(res).toBe(undefined);
    });

    test('createAccessRequest returns sucessfully with no user permissions in token', async () => {
        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendEmail',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(
            GCNotifyCaller.prototype as any,
            'sendSms',
        ).mockResolvedValueOnce(GCNotifyEmailSuccessResponse);

        jest.spyOn(AccessRequest, 'createRequest').mockResolvedValueOnce({
            createdRequest: {
                identifiers: '123',
            },
        });
        jest.spyOn(AccessRequest, 'getRequestList').mockResolvedValueOnce([]);
        const reqBody = AccessRequestValidBody;
        const res = await request(app)
            .post('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${noRoleToken}`);
        expect(res.statusCode).toBe(201);
    });

    test('createAccessRequest throws error on idir identity with no organization', async () => {
        const reqBody = AccessRequestPostNoOrgIdir;
        const res = await request(app)
            .post('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Must provide an organization.');
    });

    test('createAccessRequest throws error on no reason given', async () => {
        const reqBody = AccessRequestPostNoReason;
        const res = await request(app)
            .post('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(
            'Must provide a reason for requested user.',
        );
    });

    test('createAccessRequest returns 409 on duplicate not granted request', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockResolvedValueOnce([
            { request: 'here' },
        ]);
        const reqBody = AccessRequestValidBody;
        const res = await request(app)
            .post('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe(
            `There already exists an access request for this user: ${reqBody.userName}. Please contact your administrator.`,
        );
    });

    test('createAccessRequest returns 422 on TypeORM error', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockImplementationOnce(
            async () => {
                throw new TypeORMError('error');
            },
        );
        const reqBody = AccessRequestValidBody;
        const res = await request(app)
            .post('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe(`error`);
    });

    test('createAccessRequest returns 500 on unknown error', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockImplementationOnce(
            async () => {
                throw new Error('error');
            },
        );
        const reqBody = AccessRequestValidBody;
        const res = await request(app)
            .post('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(`error`);
    });

    /*
		GET /user-requests endpoint tests
	*/
    test('getAllRequests returns valid pending response', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockResolvedValueOnce(
            UserRequestPendingResponse,
        );
        const res = await request(app)
            .get('/user-requests?status=pending')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(UserRequestPendingResponse.length);
    });

    test('getAllRequests returns valid completed response', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockResolvedValueOnce(
            UserRequestCompletedResponse,
        );
        const res = await request(app)
            .get('/user-requests?status=completed')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(UserRequestCompletedResponse.length);
    });

    test('getAllRequests on no content returns 204', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockResolvedValueOnce([]);
        const res = await request(app)
            .get('/user-requests?status=pending')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(204);
    });

    test('getAllRequests on no access request permission returns 403', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(NoPropertySearchTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const res = await request(app)
            .get('/user-requests?status=completed')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            `Permission 'ACCESS_REQUEST' is not available for the user 'abc'`,
        );
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('getAllRequests on jwt unknown error returns 404', async () => {
        jest.spyOn(auth, 'decodingJWT').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const res = await request(app)
            .get('/user-requests?status=completed')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Oops!');
    });

    test('getAllRequests on typeORM error returns 422', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockImplementationOnce(
            () => {
                throw new TypeORMError('Oops!');
            },
        );
        const res = await request(app)
            .get('/user-requests?status=completed')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Oops!');
    });

    test('getAllRequests on generic error returns 500', async () => {
        jest.spyOn(AccessRequest, 'getRequestList').mockImplementationOnce(
            () => {
                throw new Error('Oops!', {});
            },
        );
        const res = await request(app)
            .get('/user-requests?status=completed')
            .set('Cookie', `token=${token}`)
            .send();
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Oops!');
    });

    /*
		PUT /user-requests endpoint tests
	*/
    test('updateAccessRequest returns 204 on valid request', async () => {
        jest.spyOn(AccessRequest, 'updateRequestStatus').mockResolvedValueOnce(
            2,
        );
        const reqBody = ValidUpdateAccessRequestBody;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(204);
    });

    test('updateAccessRequest returns 403 on authentication error', async () => {
        const JWT_SECRET = 'abcd';
        token = jwt.sign(NoPropertySearchTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
        const reqBody = ValidUpdateAccessRequestBody;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe(
            `Permission 'ACCESS_REQUEST' is not available for the user 'abc'`,
        );
        token = jwt.sign(SampleSuperAdminTokenPayload, JWT_SECRET, {
            expiresIn: 30 * 60 * 1000,
        });
    });

    test('updateAccessRequest on jwt unknown error returns 404', async () => {
        jest.spyOn(auth, 'decodingJWT').mockImplementationOnce(() => {
            throw new Error('Oops!');
        });
        const reqBody = ValidUpdateAccessRequestBody;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Oops!');
    });

    test('updateAccessRequest returns 404 on NotFoundError', async () => {
        jest.spyOn(AccessRequest, 'updateRequestStatus').mockImplementationOnce(
            async () => {
                throw new NotFoundError('Not found');
            },
        );
        const reqBody = ValidUpdateAccessRequestBody;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Not found');
    });

    test('updateAccessRequest returns 422 on TypeORM error', async () => {
        jest.spyOn(AccessRequest, 'updateRequestStatus').mockImplementationOnce(
            async () => {
                throw new TypeORMError('Not found');
            },
        );
        const reqBody = ValidUpdateAccessRequestBody;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Not found');
    });

    test('updateAccessRequest returns 422 on no rejection reason', async () => {
        const reqBody = UpdateAccessRequestBodyNoReason;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Must provide reason for rejection.');
    });

    test('updateAccessRequest returns 422 on no action', async () => {
        const reqBody = UpdateAccessRequestBodyNoIds;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Must provide at least 1 request id.');
    });

    test('updateAccessRequest returns 500 on unknown updateRequestStatus error', async () => {
        jest.spyOn(AccessRequest, 'updateRequestStatus').mockImplementationOnce(
            async () => {
                throw new Error('Not found');
            },
        );
        const reqBody = ValidUpdateAccessRequestBody;
        const res = await request(app)
            .put('/user-requests')
            .send(reqBody)
            .set('Cookie', `token=${token}`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe('Not found');
    });
});
