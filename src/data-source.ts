import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ActivePin } from './entity/ActivePin';
import { Permission } from './entity/Permission';
import { PinAuditLog } from './entity/PinAuditLog';
import { Users } from './entity/Users';
import { Migrations } from './entity/Migrations';
import { join } from 'path';

export const AppDataSource = new DataSource({
    type: 'postgres',
    schema: process.env.NODE_ENV === 'test' ? 'test' : 'public',
    host: process.env.DB_HOST ? process.env.DB_HOST : '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT as string) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [ActivePin, Permission, PinAuditLog, Users, Migrations],
    migrations: [join(__dirname, 'src', 'migration', '**', '*.{ts,js}')],
    synchronize:
        process.env.TYPEORM_SYNCHRONIZE?.toLowerCase() === 'true' &&
        process.env.NODE_ENV !== 'test'
            ? true
            : false,
    logging:
        process.env.TYPEORM_LOGGING?.toLowerCase() === 'true' ? true : false,
    dropSchema: false,
});
