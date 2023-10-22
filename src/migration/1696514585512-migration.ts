import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1696514585512 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table parcel_raw add column if not exists etl_log_id UUID;
        `);
        await queryRunner.query(`
            alter table title_raw add column if not exists etl_log_id UUID;
        `);
        await queryRunner.query(`
            alter table titleowner_raw add column if not exists etl_log_id UUID;
        `);
        await queryRunner.query(`
            alter table titleparcel_raw add column if not exists etl_log_id UUID;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table parcel_raw drop column if exists etl_log_id;
        `);
        await queryRunner.query(`
            alter table title_raw drop column if exists etl_log_id;
        `);
        await queryRunner.query(`
            alter table titleowner_raw drop column if exists etl_log_id;
        `);
        await queryRunner.query(`
            alter table titleparcel_raw drop column if exists etl_log_id;
        `);
    }
}
