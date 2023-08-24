import axios from 'axios';
import { stringify } from 'qs';
import 'dotenv/config';
//
import { NextFunction, Request, Response } from 'express';

const OIDC_AUTHORIZATION_URL = `${process.env.CSS_DOMAIN_NAME_URL}/auth` || '';
const OIDC_TOKEN_URL = `${process.env.CSS_DOMAIN_NAME_URL}/token` || '';
const OIDC_USER_INFO_URL = `${process.env.CSS_DOMAIN_NAME_URL}/userinfo` || '';
const OIDC_LOGOUT_URL = `${process.env.CSS_DOMAIN_NAME_URL}/logout` || '';
const OIDC_REDIRECT_URL = `${process.env.BE_APP_URL}/oauth` || '';
const OIDC_LOGOUT_REDIRECT_URL = `${process.env.BE_APP_URL}/oauth/logout` || '';

const btoa = (input: string) => Buffer.from(input).toString('base64');

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

// see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1
// TODO: identity_provider proper type
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

    const { id_token, access_token, refresh_token } = data;

    // Decode tokens to get user information
    data.id_token_decoded = decodingJWT(id_token);

    data.access_token_decoded = decodingJWT(access_token);

    data.refresh_token_decoded = decodingJWT(refresh_token);

    return data;
};

export const getUserInfo = async ({ accessToken }: any) => {
    const { data } = await axios({
        url: OIDC_USER_INFO_URL,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return data;
};

export const getLogoutUrl = () => {
    const params = {
        client_id: process.env.OIDC_CLIENT_ID,
        redirect_uri: OIDC_LOGOUT_REDIRECT_URL,
    };

    return `${OIDC_LOGOUT_URL}?${stringify(params, { encode: false })}`;
};

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const userAuthenticated = req.cookies.token === undefined ? false : true;
    if (!userAuthenticated) {
        res.redirect(`${process.env.BE_APP_URL}/login`);
    } else if (userAuthenticated) {
        next();
    }
}

// import * as express from 'express';
// import * as jwt from 'jsonwebtoken';

// export function expressAuthentication(
//   request: express.Request,
//   securityName: string,
//   scopes?: string[]
// ): Promise<any> {
//   if (securityName === 'api_key') {
//     let token;
//     if (request.query && request.query.access_token) {
//       token = request.query.access_token;
//     }

//     if (token === 'abc123456') {
//       return Promise.resolve({
//         id: 1,
//         name: 'Ironman',
//       });
//     } else {
//       return Promise.reject({});
//     }
//   }

//   if (securityName === 'jwt') {
//     const token =
//       request.body.token ||
//       request.query.token ||
//       request.headers['x-access-token']||request.cookies.token;

//     return new Promise((resolve, reject) => {
//       if (!token) {
//         reject(new Error('No token provided'));
//       }
//       jwt.verify(token, '[secret]', function (err: any, decoded: any) {
//         if (err) {
//           reject(err);
//         } else {
//           // Check if JWT contains all required scopes
//           for (const scope of scopes) {
//             if (!decoded.scopes.includes(scope)) {
//               reject(new Error('JWT does not contain required scope.'));
//             }
//           }
//           resolve(decoded);
//         }
//       });
//     });
//   }
// }

//   module.exports = { getAuthorizationUrl, getAccessToken, getUserInfo, getLogoutUrl };
