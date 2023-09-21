import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695324527299 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw DROP COLUMN IF EXISTS pids;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw ADD COLUMN IF NOT EXISTS pid INT NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw DROP COLUMN IF EXISTS pids;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw ADD COLUMN IF NOT EXISTS pid INT NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ALTER COLUMN address_line_1 DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ALTER COLUMN city DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ALTER COLUMN country DROP NOT NULL;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw ADD COLUMN IF NOT EXISTS pids VARCHAR(500) NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_raw DROP COLUMN IF EXISTS pid;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw ADD COLUMN IF NOT EXISTS pids VARCHAR(500) NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleparcel_raw DROP COLUMN IF EXISTS pid;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ALTER COLUMN address_line_1 SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ALTER COLUMN city SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.titleowner_raw ALTER COLUMN country SET NOT NULL;`,
        );
    }
}
