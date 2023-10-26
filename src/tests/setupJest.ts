import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
process.env.JWT_SECRET = 'abcd';
