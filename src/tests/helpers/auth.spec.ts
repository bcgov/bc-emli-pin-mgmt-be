import {
    decodeValue,
    getAccessToken,
    getAuthorizationUrl,
    getLogoutUrl,
    prepareTokenInfo,
    decodingJWT,
} from '../../helpers/auth';
import * as tokenHelper from '../../helpers/userTokenHelper';
import * as auth from '../../helpers/auth';
import {
    NoGUIDPayload,
    SampleBCEIDBUsinessAdminTokenPayload,
    SampleSuperAdminTokenPayload,
} from '../commonResponses';
import axios from 'axios';

describe('auth helper tests', () => {
    test(`decodeValue returns '' upon error`, () => {
        const value = decodeValue('^^^^');
        expect(value).toBe('');
    });

    test('decodingJWT returns null', () => {
        const token = decodingJWT('');
        expect(token).toBeNull();
    });

    test('prepareTokenInfo prepares a bceid business token', async () => {
        jest.spyOn(tokenHelper, 'checkActiveUser').mockResolvedValueOnce({
            roleType: SampleBCEIDBUsinessAdminTokenPayload.role,
            permissions: SampleBCEIDBUsinessAdminTokenPayload.permissions,
        });
        const token = await prepareTokenInfo(
            SampleBCEIDBUsinessAdminTokenPayload,
        );
        expect(token.identity_provider).toBe('bceidbusiness');
    });

    test('prepareTokenInfo prepares an idir token', async () => {
        jest.spyOn(tokenHelper, 'checkActiveUser').mockResolvedValueOnce({
            roleType: SampleSuperAdminTokenPayload.role,
            permissions: SampleSuperAdminTokenPayload.permissions,
        });
        const token = await prepareTokenInfo(SampleSuperAdminTokenPayload);
        expect(token.identity_provider).toBe('idir');
    });

    test('prepareTokenInfo returns undefined role and permissions if checkActiveUser fails', async () => {
        jest.spyOn(tokenHelper, 'checkActiveUser').mockImplementationOnce(
            () => {
                throw new Error('An error occurred');
            },
        );
        const token = await prepareTokenInfo(SampleSuperAdminTokenPayload);
        expect(token.role).toBe(undefined);
        expect(token.permissions).toBe(undefined);
    });

    test('prepareTokenInfo returns undefined role and permissions if no user guid is provided', async () => {
        const token = await prepareTokenInfo(NoGUIDPayload);
        expect(token.role).toBe(undefined);
        expect(token.permissions).toBe(undefined);
    });

    test('getAuthorizationUrl with identity provider', async () => {
        const url = await getAuthorizationUrl({ identity_provider: 'idir' });
        expect(url).toContain('identity_provider=idir');
    });

    test('getAuthorizationUrl without identity provider', async () => {
        const url = await getAuthorizationUrl();
        expect(url).not.toContain('identity_provider=idir');
    });

    test('getAccessToken with client secret', async () => {
        jest.spyOn(axios, 'post').mockImplementationOnce(() => {
            return Promise.resolve({ data: { access_token: 'abcd' } });
        });
        jest.spyOn(auth, 'decodingJWT').mockReturnValueOnce({
            header: 'header',
            payload: SampleSuperAdminTokenPayload,
        });
        const token = await getAccessToken({ code: 'code' });
        const decodedToken = auth.decodingJWT(token);
        expect(decodedToken?.header.typ).toBe('JWT');
        expect(decodedToken?.payload.user_guid).toBe(
            SampleSuperAdminTokenPayload.idir_user_guid,
        );
    });

    test('getAccessToken without client secret', async () => {
        delete process.env.OIDC_CLIENT_SECRET;
        jest.spyOn(axios, 'post').mockImplementationOnce(() => {
            return Promise.resolve({ data: { access_token: 'abcd' } });
        });
        jest.spyOn(auth, 'decodingJWT').mockReturnValueOnce({
            header: 'header',
            payload: SampleSuperAdminTokenPayload,
        });
        const token = await getAccessToken({ code: 'code' });
        const decodedToken = auth.decodingJWT(token);
        expect(decodedToken?.header.typ).toBe('JWT');
        expect(decodedToken?.payload.user_guid).toBe(
            SampleSuperAdminTokenPayload.idir_user_guid,
        );
    });

    test('getLogoutURL returns a url based on env variables', () => {
        const url = getLogoutUrl();
        expect(url).toContain('/logout?client_id=abcd&redirect_uri=');
    });

    test('getAccessToken without JWT secret', async () => {
        process.env.JWT_SECRET = '';
        jest.spyOn(axios, 'post').mockImplementationOnce(() => {
            return Promise.resolve({ data: { access_token: 'abcd' } });
        });
        jest.spyOn(auth, 'decodingJWT').mockReturnValueOnce({
            header: 'header',
            payload: SampleSuperAdminTokenPayload,
        });
        await expect(getAccessToken({ code: 'code' })).rejects.toThrow(
            'No secret defined',
        );
        process.env.JWT_SECRET = 'abcd';
    });
});
