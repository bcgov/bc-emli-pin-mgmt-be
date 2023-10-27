import {
    decodeValue,
    getAuthorizationUrl,
    prepareTokenInfo,
} from '../../helpers/auth';
import * as tokenHelper from '../../helpers/userTokenHelper';
import {
    SampleBCEIDBUsinessAdminTokenPayload,
    SampleSuperAdminTokenPayload,
} from '../commonResponses';

describe('auth helper tests', () => {
    test(`decodeValue returns '' upon error`, () => {
        const value = decodeValue('^^^^');
        expect(value).toBe('');
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

    test('getAuthorizationUrl with identity provider', async () => {
        const url = await getAuthorizationUrl({ identity_provider: 'idir' });
        expect(url).toContain('identity_provider=idir');
    });

    test('getAuthorizationUrl without identity provider', async () => {
        const url = await getAuthorizationUrl();
        expect(url).not.toContain('identity_provider=idir');
    });
});
