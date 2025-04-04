import { checkActiveUser } from './userTokenHelper';
import { post } from 'axios';
import { stringify } from 'qs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import logger from '../middleware/logger';

const OIDC_AUTHORIZATION_URL = `${process.env.CSS_DOMAIN_NAME_URL}/auth`;
const OIDC_TOKEN_URL = `${process.env.CSS_DOMAIN_NAME_URL}/token`;
const OIDC_LOGOUT_URL = `${process.env.CSS_DOMAIN_NAME_URL}/logout`;
const OIDC_REDIRECT_URL = `${process.env.BE_APP_URL}/oauth`;
const OIDC_BCSC_REDIRECT_URL = `${process.env.BE_APP_URL}/bcsc/userinfo`;
const OIDC_LOGOUT_REDIRECT_URL = `${process.env.BE_APP_URL}/oauth/logout`;

const btoa = (input: string) => Buffer.from(input).toString('base64');
const tokenExpiry = 30 * 60 * 1000;

export const decodeValue = (base64String: string) => {
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

export const prepareTokenInfo = async (tokenPayload: any) => {
    console.log(tokenPayload.email, '------>token:', tokenPayload);
    const tokenDetails: any = {};
    const identityType = tokenPayload.identity_provider;
    tokenDetails.sid = tokenPayload.sid;
    tokenDetails.user_guid =
        identityType === 'idir'
            ? tokenPayload.idir_user_guid
            : tokenPayload.bceid_user_guid;
    tokenDetails.identity_provider = tokenPayload.identity_provider;
    tokenDetails.username =
        identityType === 'idir'
            ? tokenPayload.idir_username
            : tokenPayload.bceid_username;
    tokenDetails.preferred_username = tokenPayload.preferred_username;
    tokenDetails.given_name = tokenPayload.given_name;
    tokenDetails.display_name = tokenPayload.display_name;
    tokenDetails.family_name = tokenPayload.family_name;
    tokenDetails.email = tokenPayload.email;
    if (identityType === 'bceidbusiness') {
        tokenDetails.bceid_business_name = tokenPayload.bceid_business_name;
    }
    let activeUser;
    try {
        if (
            tokenDetails.user_guid === undefined ||
            tokenDetails.user_guid === null
        ) {
            logger.error(
                `prepareTokenInfo error: No user_guid was provided in token`,
            );
            throw new Error(``);
        }
        activeUser = await checkActiveUser(tokenDetails.user_guid);
    } catch (err) {
        // this error is already logged in the previous function, so just set permissions to null
        activeUser = { roleType: null, permissions: null };
    }
    if (activeUser.roleType !== null && activeUser.permissions !== null) {
        tokenDetails.role = activeUser.roleType;
        tokenDetails.permissions = activeUser.permissions;
    }
    return tokenDetails;
};

// see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1
export const getAuthorizationUrl = async ({
    identity_provider,
    siteId,
    redirect,
}: { identity_provider?: any; siteId?: string; redirect?: string } = {}) => {
    // Define params with an optional kc_idp_hint property
    let params: {
        client_id: string | undefined;
        response_type: string | undefined;
        scope: string | undefined;
        redirect_uri: string;
        identity_provider?: any;
        kc_idp_hint?: string; // kc_idp_hint is for BCSC only at this time
        state?: string; // Include siteID as a parameter
    };

    // Give an option to select an identity provider.
    if (identity_provider) {
        params = {
            client_id: process.env.OIDC_CLIENT_ID,
            response_type: process.env.OIDC_RESPONSE_TYPE,
            scope: process.env.OIDC_SCOPE,
            redirect_uri: OIDC_REDIRECT_URL,
            identity_provider: identity_provider,
        };

        // Add kc_idp_hint when identity provider type is 'bcsc'
        if (identity_provider === 'bcsc') {
            params.redirect_uri = OIDC_BCSC_REDIRECT_URL; // redirect to a different user to get the userinfo
            params.client_id = process.env.BCSC_OIDC_CLIENT_ID;
            params.kc_idp_hint = process.env.BCSC_OIDC_CLIENT_ID; // kc_idp_hint is our CLIENT_ID
            params.state = encodeURIComponent(
                JSON.stringify({ siteId, redirect }),
            );
        }
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
    const JWT_SECRET =
        process.env.JWT_SECRET && process.env.JWT_SECRET !== ''
            ? process.env.JWT_SECRET
            : '';
    if (JWT_SECRET === '') {
        throw new Error('No secret defined');
    }
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

    const { data } = Object.hasOwn(config, 'headers')
        ? await post(url, config.data, { headers: config.headers })
        : await post(url, config.data);

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
