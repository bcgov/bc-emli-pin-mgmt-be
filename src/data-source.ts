import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ActivePin } from './entity/ActivePin';
import { Permission } from './entity/Permission';
import { PinAuditLog } from './entity/PinAuditLog';
import { Users } from './entity/Users';

export const AppDataSource = new DataSource({
    type: 'postgres',
    schema: process.env.NODE_ENV === 'test' ? 'test' : 'db',
    host: process.env.TYPEORM_HOST ? process.env.TYPEORM_HOST : '127.0.0.1',
    port: process.env.TYPEORM_PORT
        ? parseInt(process.env.TYPEORM_PORT as string)
        : 5432,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [ActivePin, Permission, PinAuditLog, Users],
    migrations: ['./src/migration/**/*.ts'],
    synchronize:
        process.env.TYPEORM_SYNCHRONIZE?.toLowerCase() === 'true' &&
        process.env.NODE_ENV !== 'test'
            ? true
            : false,
    logging:
        process.env.TYPEORM_LOGGING?.toLowerCase() === 'true' ? true : false,
    // dropSchema: process.env.NODE_ENV==='test' ? true: false
});
