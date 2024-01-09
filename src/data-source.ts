import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ActivePin } from './entity/ActivePin';
import { Permission } from './entity/Permission';
import { PinAuditLog } from './entity/PinAuditLog';
import { Users } from './entity/Users';
import { Migrations } from './entity/Migrations';
import { AccessRequest } from './entity/AccessRequest';
import { join } from 'path';
import { VhersAuditLog } from './entity/VhersAuditLog';

export const AppDataSource = new DataSource({
    type: 'postgres',
    schema: process.env.NODE_ENV === 'test' ? 'test' : 'public',
    host:
        typeof process.env.DB_HOST === 'undefined' ||
        process.env.DB_HOST === '127.0.0.1'
            ? '127.0.0.1'
            : process.env.DB_HOST,
    port:
        typeof process.env.DB_PORT === 'undefined' ||
        process.env.DB_PORT === '5432'
            ? 5432
            : parseInt(process.env.DB_PORT as string),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        ActivePin,
        Permission,
        PinAuditLog,
        Users,
        Migrations,
        AccessRequest,
        VhersAuditLog,
    ],
    migrations: [join(__dirname, 'migration', '**.ts')],
    synchronize:
        process.env.TYPEORM_SYNCHRONIZE?.toLowerCase() === 'true' &&
        process.env.NODE_ENV !== 'test'
            ? true
            : false,
    logging:
        process.env.TYPEORM_LOGGING?.toLowerCase() === 'true' ? true : false,
    dropSchema: false,
});
