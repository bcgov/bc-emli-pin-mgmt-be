import 'dotenv/config';

const prevValues = {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    TYPEORM_SYNCHRONIZE: process.env.TYPEORM_SYNCHRONIZE,
    TYPEORM_LOGGING: process.env.TYPEORM_LOGGING,
};

if (process.env.NODE_ENV === 'test') delete process.env.NODE_ENV;
if (process.env.DB_HOST !== '127.0.0.1') process.env.DB_HOST = '127.0.0.1';
else delete process.env.DB_HOST;
if (process.env.DB_PORT !== '5432') delete process.env.DB_PORT;
else process.env.DB_PORT = '1111';
process.env.TYPEORM_SYNCHRONIZE = 'true';
process.env.TYPEORM_LOGGING?.toLowerCase() === 'true'
    ? (process.env.TYPEORM_LOGGING = 'false')
    : (process.env.TYPEORM_LOGGING = 'true');

import { AppDataSource } from '../data-source';
describe('data-source tests', () => {
    test('import AppDataSource with different parameters', async () => {
        expect(AppDataSource.options.type).toBe('postgres');
    });
    afterAll(async () => {
        process.env.NODE_ENV = prevValues.NODE_ENV;
        process.env.DB_HOST = prevValues.DB_HOST;
        process.env.DB_PORT = prevValues.DB_PORT;
        process.env.TYPEORM_SYNCHRONIZE = prevValues.TYPEORM_SYNCHRONIZE;
        process.env.TYPEORM_LOGGING = prevValues.TYPEORM_LOGGING;
        jest.resetModules();
    });
});
