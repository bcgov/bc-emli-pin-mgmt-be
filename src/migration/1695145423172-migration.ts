import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695145423172 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE IF EXISTS raw_title_data RENAME TO title_raw;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS raw_parcel_data RENAME TO parcel_raw;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS raw_titleparcel_data RENAME TO titleparcel_raw;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS raw_titleowner_data RENAME TO titleowner_raw;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE IF EXISTS title_raw RENAME TO raw_title_data;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS parcel_raw RENAME TO raw_parcel_data;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS titleparcel_raw RENAME TO raw_titleparcel_data;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS titleowner_raw RENAME TO raw_titleowner_data;`,
        );
    }
}
