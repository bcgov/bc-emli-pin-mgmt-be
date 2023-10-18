import 'dotenv/config';
import { Request } from 'express';
import { AuthenticationError } from './AuthenticationError';

const VHERS_API_KEY = process.env.VHERS_API_KEY || '';

export function expressAuthentication(
    req: Request,
    securityName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scopes?: string[],
): Promise<any> {
    if (securityName === 'vhers_api_key') {
        // Extract api key from the request header.
        const apiKey = req.header('x-api-key');

        // Check if api key exists
        if (!apiKey)
            return Promise.reject(
                new AuthenticationError('Access Denied', 401),
            );

        if (apiKey === VHERS_API_KEY) {
            return Promise.resolve({});
        } else
            return Promise.reject(
                new AuthenticationError('Invalid Token', 400),
            );
    } else return Promise.reject(new AuthenticationError('Invalid Token', 400));
}
