import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695777726084 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.title_raw ADD COLUMN IF NOT EXISTS unique_key VARCHAR(500)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.title_raw DROP CONSTRAINT IF EXISTS unique_constraint_title`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.title_raw ADD CONSTRAINT unique_constraint_title UNIQUE (unique_key)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.title_raw ALTER COLUMN title_status TYPE VARCHAR(1)`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw ADD COLUMN IF NOT EXISTS unique_key VARCHAR(500)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw DROP CONSTRAINT IF EXISTS unique_constraint_parcel`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw ADD CONSTRAINT unique_constraint_parcel UNIQUE (unique_key)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw ALTER COLUMN parcel_status TYPE VARCHAR(1)`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw ADD COLUMN IF NOT EXISTS unique_key VARCHAR(500)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw DROP CONSTRAINT IF EXISTS unique_constraint_titleparcel`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw ADD CONSTRAINT unique_constraint_titleparcel UNIQUE (unique_key)`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ADD COLUMN IF NOT EXISTS unique_key VARCHAR(500)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw DROP CONSTRAINT IF EXISTS unique_constraint_titleowner`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ADD CONSTRAINT unique_constraint_titleowner UNIQUE (unique_key)`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ADD COLUMN IF NOT EXISTS unique_key VARCHAR(500)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin DROP CONSTRAINT IF EXISTS unique_constraint_active_pin`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ADD CONSTRAINT unique_constraint_active_pin UNIQUE (unique_key)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN title_status TYPE VARCHAR(1)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.title_raw DROP COLUMN IF EXISTS unique_key`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.title_raw DROP CONSTRAINT IF EXISTS unique_constraint_title`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.title_status_type`,
        );
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.title_status_type AS ENUM ('R', 'C');`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.title_raw ALTER COLUMN title_status TYPE title_status_type`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw DROP COLUMN IF EXISTS unique_key`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw DROP CONSTRAINT IF EXISTS unique_constraint_parcel`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.parcel_status_type`,
        );
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.parcel_status_type AS ENUM ('A', 'I');`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw ALTER COLUMN parcel_status TYPE parcel_status_type`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw DROP COLUMN IF EXISTS unique_key`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw DROP CONSTRAINT IF EXISTS unique_constraint_titleparcel`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw DROP COLUMN IF EXISTS unique_key`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw DROP CONSTRAINT IF EXISTS unique_constraint_titleowner`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin DROP COLUMN IF EXISTS unique_key`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin DROP CONSTRAINT IF EXISTS unique_constraint_active_pin`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.title_status_type`,
        );
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.title_status_type AS ENUM ('R', 'C');`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN title_status TYPE title_status_type`,
        );
    }
}
