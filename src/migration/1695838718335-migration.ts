import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695838718335 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // title_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.title_raw
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.title_raw (
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                title_status VARCHAR(1) NOT NULL,
                from_title_number VARCHAR(11) NULL,
                from_land_title_district VARCHAR(2) NULL,
                CONSTRAINT unique_const_title UNIQUE (title_number, land_title_district, title_status, from_title_number, from_land_title_district)
            )
        `);

        // parcel_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.parcel_raw
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.parcel_raw (
                pid INT NOT NULL,
                parcel_status VARCHAR(1) NOT NULL,
                CONSTRAINT unique_const_parcel UNIQUE (pid, parcel_status)
            )
        `);

        // titleparcel_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.titleparcel_raw
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.titleparcel_raw (
                pid INT NOT NULL,
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                CONSTRAINT unique_const_titleparcel UNIQUE (pid, title_number, land_title_district)
            )
        `);

        // titleowner_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.titleowner_raw
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.titleowner_raw (
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                given_name VARCHAR(50) NULL,
                last_name_1 VARCHAR(75) NULL,
                last_name_2 VARCHAR(75) NULL,
                occupation VARCHAR(50) NULL,
                incorporation_number VARCHAR(12) NULL,
                address_line_1 VARCHAR(65) NULL,
                address_line_2 VARCHAR(65) NULL,
                city VARCHAR(30) NULL,
                province_abbreviation BPCHAR(2) NULL,
                province_long VARCHAR(24) NULL,
                country VARCHAR(38) NULL,
                postal_code VARCHAR(12) NULL,
                CONSTRAINT unique_const_titleowner UNIQUE (
                    title_number, 
                    land_title_district, 
                    given_name,
                    last_name_1, 
                    last_name_2, 
                    occupation, 
                    incorporation_number, 
                    address_line_1,
                    address_line_2,
                    city,
                    province_abbreviation,
                    province_long,
                    country,
                    postal_code
                )
            )
        `);

        // active_pin table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.active_pin
        `);

        await queryRunner.query(`
            CREATE TABLE ${schemaName}.active_pin (
                live_pin_id UUID NOT NULL DEFAULT uuid_generate_v4(),
                pin VARCHAR(8) NULL,
                pids VARCHAR(500) NOT NULL,
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                title_status VARCHAR(1) NOT NULL,
                from_title_number VARCHAR(11) NULL,
                from_land_title_district VARCHAR(2) NULL,
                given_name VARCHAR(50) NULL,
                last_name_1 VARCHAR(75) NULL,
                last_name_2 VARCHAR(75) NULL,
                incorporation_number VARCHAR(12) NULL,
                address_line_1 VARCHAR(65) NULL,
                address_line_2 VARCHAR(65) NULL,
                city VARCHAR(30) NULL,
                province_abbreviation BPCHAR(2) NULL,
                province_long VARCHAR(24) NULL,
                country VARCHAR(38) NULL,
                postal_code VARCHAR(12) NULL,
                created_at timestamptz NOT NULL DEFAULT now(),
                updated_at timestamptz NULL,
                CONSTRAINT active_pin_pkey PRIMARY KEY (live_pin_id),
                CONSTRAINT unique_const_activepin UNIQUE (
                    pids,
                    title_number, 
                    land_title_district, 
                    title_status,
                    from_title_number,
                    from_land_title_district,
                    given_name,
                    last_name_1, 
                    last_name_2, 
                    incorporation_number, 
                    address_line_1,
                    address_line_2,
                    city,
                    province_abbreviation,
                    province_long,
                    country,
                    postal_code
                )
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // title_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.title_raw
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.title_raw (
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                title_status VARCHAR(1) NOT NULL,
                from_title_number VARCHAR(11) NULL,
                from_land_title_district VARCHAR(2) NULL,
                unique_key VARCHAR(500) NULL,
            );
        `);

        // parcel_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.parcel_raw
        `);
        await queryRunner.query(`
            CREATE TABLE public.parcel_raw (
                pid INT NOT NULL,
                parcel_status VARCHAR(1) NOT NULL,
                unique_key VARCHAR(64) NULL,
            );
        `);

        // titleparcel_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.titleparcel_raw
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.titleparcel_raw (
                pid INT NOT NULL,
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                unique_key VARCHAR(500) NULL,
            )
        `);

        // titleowner_raw table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.titleowner_raw
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.titleowner_raw (
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                given_name VARCHAR(50) NULL,
                last_name_1 VARCHAR(75) NULL,
                last_name_2 VARCHAR(75) NULL,
                occupation VARCHAR(50) NULL,
                incorporation_number VARCHAR(12) NULL,
                address_line_1 VARCHAR(65) NULL,
                address_line_2 VARCHAR(65) NULL,
                city VARCHAR(30) NULL,
                province_abbreviation bpchar(2) NULL,
                province_long VARCHAR(24) NULL,
                country VARCHAR(38) NULL,
                postal_code VARCHAR(12) NULL,
                unique_key VARCHAR(500) NULL,
            )
        `);

        // active_pin table
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.active_pin
        `);

        await queryRunner.query(`
            CREATE TABLE ${schemaName}.active_pin (
                live_pin_id uuid NOT NULL DEFAULT uuid_generate_v4(),
                pin VARCHAR(8) NULL,
                pids VARCHAR(500) NOT NULL,
                title_number VARCHAR(11) NOT NULL,
                land_title_district VARCHAR(2) NOT NULL,
                title_status VARCHAR(1) NOT NULL,
                from_title_number VARCHAR(11) NULL,
                from_land_title_district VARCHAR(2) NULL,
                given_name VARCHAR(50) NULL,
                last_name_1 VARCHAR(75) NULL,
                last_name_2 VARCHAR(75) NULL,
                incorporation_number VARCHAR(12) NULL,
                address_line_1 VARCHAR(65) NULL,
                address_line_2 VARCHAR(65) NULL,
                city VARCHAR(30) NULL,
                province_abbreviation bpchar(2) NULL,
                province_long VARCHAR(24) NULL,
                country VARCHAR(38) NULL,
                postal_code VARCHAR(12) NULL,
                created_at timestamptz NOT NULL DEFAULT now(),
                updated_at timestamptz NULL,
                unique_key VARCHAR(500) NULL,
                CONSTRAINT active_pin_pkey PRIMARY KEY (live_pin_id),
            )
        `);
    }
}
