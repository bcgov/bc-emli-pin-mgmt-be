import { MigrationInterface } from 'typeorm';

export class Migration1702317115115 implements MigrationInterface {
    public async up(): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        `ALTER TABLE IF EXISTS ${schemaName}.etl_log ALTER COLUMN updated_at TYPE timestamptz;`;
    }

    public async down(): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        `ALTER TABLE IF EXISTS ${schemaName}.etl_log ALTER COLUMN updated_at TYPE TIMESTAMP;`;
    }
}
