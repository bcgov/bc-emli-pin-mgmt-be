import { MigrationInterface, QueryRunner } from 'typeorm';
import 'dotenv/config';

export class Create1690919775722 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`
		CREATE EXTENSION IF NOT EXISTS citext;`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        /* 
		-- USER -------------------------------------------
		-- Table Definition ---------------------------------------------- 
		*/
        await queryRunner.query(`DROP TYPE IF EXISTS ${schemaName}.role_type`);
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.role_type AS ENUM ('Standard', 'Admin', 'SuperAdmin');`,
        );

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."users" (
			user_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
			user_guid VARCHAR(36) NOT NULL,
			identity_type VARCHAR(10) NOT NULL,
			role ${schemaName}.role_type NOT NULL, 
			organization VARCHAR(50) NOT NULL,
			email CITEXT NOT NULL,
			user_name VARCHAR(50) NOT NULL,
			first_name VARCHAR(50) NOT NULL,
			last_name VARCHAR(75) NOT NULL,
			is_active BOOLEAN NOT NULL
		);`);
        /*
		-- ACTIVE PIN -------------------------------------------
		-- Table Definition ----------------------------------------------
		
		-- PARCEL STATUS TYPES: 
			-- A - Active
			-- I - Inactive (i.e., cancelled)
		*/
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.parcel_status_type`,
        );
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.parcel_status_type AS ENUM ('A', 'I');`,
        );

        /*
		-- TITLE STATUS TYPES:
			-- R - Registered
			-- C - Cancelled
		*/
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.title_status_type`,
        );
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.title_status_type AS ENUM ('R', 'C');`,
        );

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."active_pin" (
			live_pin_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
			pin VARCHAR(8),
			pid INT NOT NULL,
			parcel_status ${schemaName}.parcel_status_type NOT NULL,
			title_number VARCHAR(11) NOT NULL,
			land_title_district VARCHAR(2) NOT NULL,
			title_status ${schemaName}.title_status_type NOT NULL,
			from_title_number VARCHAR(11),
			from_land_title_district VARCHAR(2),
			given_name VARCHAR(50),
			last_name_1 VARCHAR(75),
			last_name_2 VARCHAR(75),
			incorporation_number VARCHAR(12),
			address_line_1 VARCHAR(65) NOT NULL,
			address_line_2 VARCHAR(65),
			city VARCHAR(30) NOT NULL,
			province CHAR(2),
			other_geographic_division VARCHAR(24),
			country VARCHAR(38) NOT NULL,
			postal_code VARCHAR(12),
			created_at TIMESTAMP NOT NULL DEFAULT now(),
			updated_at TIMESTAMP
		);`);

        /*
		-- PERMISSION -------------------------------------------
		-- Table Definition ----------------------------------------------
		*/
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."permission" (
			permission_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
			permission VARCHAR(50) NOT NULL,
			role ${schemaName}.role_type NOT NULL
		);`);

        /*
		-- LOG -------------------------------------------
		-- Table Definition ----------------------------------------------
		
		-- PIN EXPIRATION REASONS: 
			-- OP - Opt-out
			-- CC - call center pin reset (i.e., forgotten PIN)
			-- OR - online pin reset
			-- CO - change of ownership (title cancelled or parcel inactive)
		*/
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.expiration_reason_type`,
        );
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.expiration_reason_type AS ENUM ('OP', 'CC', 'OR', 'CO');`,
        );

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."pin_audit_log" (
			log_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
			pin VARCHAR(8) NOT NULL,
			pid INT NOT NULL,
			parcel_status ${schemaName}.parcel_status_type NOT NULL,
			title_number VARCHAR(11) NOT NULL, 
			land_title_district VARCHAR(2) NOT NULL,
			from_title_number VARCHAR(11),
			from_land_title_district VARCHAR(2),
			title_status ${schemaName}.title_status_type NOT NULL,
			expired_at TIMESTAMP, 
			expiration_reason ${schemaName}.expiration_reason_type, 
			sent_to_email CITEXT, 
			sent_to_phone VARCHAR(12)
		);`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`DROP TABLE IF EXISTS ${schemaName}."users"`);
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."pin_audit_log"`,
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."permission"`,
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."active_pin"`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.parcel_status_type`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.title_status_type`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.expiration_reason_type`,
        );
    }
}
