/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
import * as AccessRequest from '../../db/AccessRequest.db';
import GCNotifyCaller from '../../helpers/GCNotifyCaller';
import { GCNotifyEmailSuccessResponse } from '../commonResponses';
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

describe('Access Request endpoints', () => {
    let proto: { createAccessRequest: () => void },
        controller: AccessRequestController;
    beforeAll(() => {
        controller = new AccessRequestController();
        proto = Object.getPrototypeOf(controller);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

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

        const reqBody = {
            userGuid: '82dc08e5-cbca-40c2-9d35-a4d1407d5f8d',
            identityType: 'idir',
            requestedRole: 'Admin',
            organization: 'Bc Service',
            email: 'abc@gov.ca',
            userName: 'johndoe',
            givenName: 'John',
            lastName: 'Doe',
            requestReason: 'To get access to site',
        };
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
});
