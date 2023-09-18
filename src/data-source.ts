import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ActivePin } from './entity/ActivePin';
import { Permission } from './entity/Permission';
import { PinAuditLog } from './entity/PinAuditLog';
import { Employee } from './entity/Employee';
import { Migrations } from './entity/Migrations';
import { join } from 'path';
import { AccessRequest } from './entity/AccessRequest';

export const AppDataSource = new DataSource({
    type: 'postgres',
    schema: process.env.NODE_ENV === 'test' ? 'test' : 'public',
    host: process.env.DB_HOST ? process.env.DB_HOST : '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT as string) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        ActivePin,
        Permission,
        PinAuditLog,
        Employee,
        Migrations,
        AccessRequest,
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
