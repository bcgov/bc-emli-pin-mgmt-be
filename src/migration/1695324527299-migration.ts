import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695324527299 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."parcel_raw"`,
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."parcel_raw" (
            pid INT NOT NULL,
            parcel_status ${schemaName}.parcel_status_type NOT NULL
        );`);

        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."titleparcel_raw"`,
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."titleparcel_raw" (
            pid INT NOT NULL,
            title_number VARCHAR(11) NOT NULL,
            land_title_district VARCHAR(2) NOT NULL
        );`);

        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."titleowner_raw"`,
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."titleowner_raw" (
            title_number VARCHAR(11) NOT NULL,
            land_title_district VARCHAR(2) NOT NULL,
            given_name VARCHAR(50),
            last_name_1 VARCHAR(75),
            last_name_2 VARCHAR(75),
            occupation VARCHAR(50),
            incorporation_number VARCHAR(12),
            address_line_1 VARCHAR(65),
            address_line_2 VARCHAR(65),
            city VARCHAR(30),
            province_abbreviation CHAR(2),
            province_long VARCHAR(24),
            country VARCHAR(38),
            postal_code VARCHAR(12)
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."parcel_raw"`,
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."parcel_raw" (
            pids VARCHAR(500) NOT NULL,
            parcel_status ${schemaName}.parcel_status_type NOT NULL
        );`);

        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."titleparcel_raw"`,
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."raw_titleparcel_data" (
            pids VARCHAR(500) NOT NULL,
            title_number VARCHAR(11) NOT NULL,
            land_title_district VARCHAR(2) NOT NULL
        );`);

        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."titleowner_raw"`,
        );
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."titleowner_raw" (
            title_number VARCHAR(11) NOT NULL,
            land_title_district VARCHAR(2) NOT NULL,
            given_name VARCHAR(50),
            last_name_1 VARCHAR(75),
            last_name_2 VARCHAR(75),
            occupation VARCHAR(50),
            incorporation_number VARCHAR(12),
            address_line_1 VARCHAR(65) NOT NULL,
            address_line_2 VARCHAR(65),
            city VARCHAR(30) NOT NULL,
            province_abbreviation CHAR(2),
            province_long VARCHAR(24),
            country VARCHAR(38) NOT NULL,
            postal_code VARCHAR(12)
        );`);
    }
}
