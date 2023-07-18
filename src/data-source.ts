// Template (no real data). To be fixed and hidden in gitignore
// Cannot add in db startup code at this time to src/index.ts as it will obviously error out
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test',
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
