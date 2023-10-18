import { checkActiveUser } from './userTokenHelper';
import axios from 'axios';
import { stringify } from 'qs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const OIDC_AUTHORIZATION_URL = `${process.env.CSS_DOMAIN_NAME_URL}/auth` || '';
const OIDC_TOKEN_URL = `${process.env.CSS_DOMAIN_NAME_URL}/token` || '';
const OIDC_LOGOUT_URL = `${process.env.CSS_DOMAIN_NAME_URL}/logout` || '';
const OIDC_REDIRECT_URL = `${process.env.BE_APP_URL}/oauth` || '';
const OIDC_LOGOUT_REDIRECT_URL = `${process.env.BE_APP_URL}/oauth/logout` || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

const btoa = (input: string) => Buffer.from(input).toString('base64');
const tokenExpiry = 30 * 60 * 1000;

const decodeValue = (base64String: string) => {
    try {
        return JSON.parse(
            Buffer.from(base64String, 'base64').toString('ascii'),
        );
    } catch {
        return '';
    }
};

export const decodingJWT = (token: string) => {
    if (!token) return null;

    const [header, payload] = token.split('.');

    return {
        header: decodeValue(header),
        payload: decodeValue(payload),
    };
};

const prepareTokenInfo = async (tokenPayload: any) => {
    const tokenDetails: any = {};
    tokenDetails.sid = tokenPayload.sid;
    tokenDetails.idir_user_guid = tokenPayload.idir_user_guid;
    tokenDetails.identity_provider = tokenPayload.identity_provider;
    tokenDetails.idir_username = tokenPayload.idir_username;
    tokenDetails.email_verified = tokenPayload.email_verified;
    tokenDetails.preferred_username = tokenPayload.preferred_username;
    tokenDetails.given_name = tokenPayload.given_name;
    tokenDetails.display_name = tokenPayload.display_name;
    tokenDetails.family_name = tokenPayload.family_name;
    tokenDetails.email = tokenPayload.email;

    const activeUser = await checkActiveUser(tokenDetails.idir_user_guid);
    console.log(activeUser);
    if (activeUser.roleType !== null && activeUser.permissions !== null) {
        tokenDetails.role = activeUser.roleType;
        tokenDetails.permissions = activeUser.permissions;
    }

    return tokenDetails;
};

// see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1
export const getAuthorizationUrl = async ({
    identity_provider,
}: { identity_provider?: any } = {}) => {
    let params;
    // Give an option to select an identity provider.
    if (identity_provider) {
        params = {
            client_id: process.env.OIDC_CLIENT_ID,
            response_type: process.env.OIDC_RESPONSE_TYPE,
            scope: process.env.OIDC_SCOPE,
            redirect_uri: OIDC_REDIRECT_URL,
            identity_provider: identity_provider,
        };
    } else {
        params = {
            client_id: process.env.OIDC_CLIENT_ID,
            response_type: process.env.OIDC_RESPONSE_TYPE,
            scope: process.env.OIDC_SCOPE,
            redirect_uri: OIDC_REDIRECT_URL,
        };
    }

    return `${OIDC_AUTHORIZATION_URL}?${stringify(params, { encode: false })}`;
};

// see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3
export const getAccessToken = async ({ code }: any) => {
    const url = OIDC_TOKEN_URL;
    const params = {
        grant_type: process.env.OIDC_GRANT_TYPE,
        client_id: process.env.OIDC_CLIENT_ID,
        redirect_uri: OIDC_REDIRECT_URL,
        code,
    };
    let config;
    if (process.env.OIDC_CLIENT_SECRET) {
        config = {
            url,
            method: 'post',
            data: stringify(params),
            headers: {
                Authorization: `Basic ${btoa(
                    `${process.env.OIDC_CLIENT_ID}:${process.env.OIDC_CLIENT_SECRET}`,
                )}`,
            },
        };
    } else {
        config = {
            url,
            method: 'post',
            data: stringify(params),
        };
    }

    const { data } = await axios(config);

    const { access_token } = data;

    const userInfo = decodingJWT(access_token);
    const tokenDetails = await prepareTokenInfo(userInfo?.payload);
    const signedToken = jwt.sign(tokenDetails, JWT_SECRET, {
        expiresIn: tokenExpiry,
    });
    return signedToken;
};

export const getLogoutUrl = () => {
    const params = {
        client_id: process.env.OIDC_CLIENT_ID,
        redirect_uri: OIDC_LOGOUT_REDIRECT_URL,
    };

    return `${OIDC_LOGOUT_URL}?${stringify(params, { encode: false })}`;
};
