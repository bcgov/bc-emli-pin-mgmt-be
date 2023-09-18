import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1693322911755 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';

        // Employee / Users table updates
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN organization DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN user_name DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN user_name TYPE varchar(100);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users RENAME COLUMN user_name TO username;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users RENAME COLUMN first_name TO given_name;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ADD COLUMN IF NOT EXISTS display_name varchar(125) NOT NULL;`,
        );

        // Pin audit log table updates
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN pid TYPE varchar(500) USING pid::varchar(500);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log RENAME COLUMN pid TO pids;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN pin_created_at DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN expired_by_username TYPE varchar(100);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log RENAME COLUMN expired_by_username TO altered_by_username;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS expired_by_name;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS parcel_status;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS altered_by_user_guid varchar(36);`,
        );
        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.log_expiration()
		RETURNS trigger
		LANGUAGE plpgsql
	   AS $function$ 
	   BEGIN 
		   INSERT INTO ${schemaName}.pin_audit_log 
		   (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,action,expired_at) 
		   VALUES (OLD.pin,OLD.pids,OLD.title_number,OLD.land_title_district,OLD.from_title_number,OLD.from_land_title_district,OLD.title_status,OLD.live_pin_id,'D',now());
		   RETURN OLD;
	   END
	   $function$
	   ;`);
        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.log_create()
		 RETURNS trigger
		 LANGUAGE plpgsql
		AS $function$ 
			   BEGIN
				   IF OLD.pin IS NULL
				   THEN
					   INSERT INTO ${schemaName}.pin_audit_log 
					   (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action) 
					   VALUES (NEW.pin,NEW.pids,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,now(),'C');
				   ELSE
				   INSERT INTO ${schemaName}.pin_audit_log 
				   (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,ACTION,expired_at) 
				   VALUES (OLD.pin,OLD.pids,OLD.title_number,OLD.land_title_district,OLD.from_title_number,OLD.from_land_title_district,OLD.title_status,OLD.live_pin_id,'R',now());
				   INSERT INTO ${schemaName}.pin_audit_log 
					   (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action) 
					   VALUES (NEW.pin,NEW.pids,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,now(),'C');
				   END IF;
				   
				   RETURN NEW;
			   END
			   $function$
		;`);

        // Parcel pin table (may not exist on server?)
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.parcel_pin DROP CONSTRAINT parcel_pin_live_pin_id_fkey;`,
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}.parcel_pin;`,
        );

        // Active pin table
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN pid TYPE varchar(500) USING pid::varchar(500);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin RENAME COLUMN pid TO pids;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin DROP COLUMN IF EXISTS parcel_status;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN address_line_1 DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN city DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin RENAME COLUMN province TO province_abbreviation;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin RENAME COLUMN other_geographic_division TO province_long;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN country DROP NOT NULL;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN pids TYPE INT USING pids::int4;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin RENAME COLUMN pids TO pid;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ADD COLUMN IF NOT EXISTS parcel_status ${schemaName}.parcel_status_type NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN address_line_1 SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN city SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin RENAME COLUMN province_abbreviation TO province;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin RENAME COLUMN province_long TO other_geographic_division;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN country SET NOT NULL;`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN pid TYPE INT USING pids::int4;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log RENAME COLUMN pids TO pid;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN pin_created_at SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN altered_by_username TYPE varchar(50);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log RENAME COLUMN altered_by_username TO expired_by_username;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS expired_by_name varchar(75);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS parcel_status ${schemaName}.parcel_status_type NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP CONSTRAINT fk_altered_by_user_id;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS altered_by_user_id;`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS employee RENAME TO users;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN organization SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN email SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN user_name SET NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN user_name TYPE varchar(50);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users RENAME COLUMN username TO user_name;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users RENAME COLUMN given_name TO first_name;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users DROP COLUMN IF EXISTS display_name;`,
        );

        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.log_expiration()
		RETURNS trigger
		LANGUAGE plpgsql
	   AS $function$ 
	   BEGIN 
		   INSERT INTO ${schemaName}.pin_audit_log 
		   (pin,pid,parcel_status,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action,expired_at) 
		   VALUES (OLD.pin,OLD.pid,OLD.parcel_status,OLD.title_number,OLD.land_title_district,OLD.from_title_number,OLD.from_land_title_district,OLD.title_status,OLD.live_pin_id,OLD.created_at,'D',now());
		   RETURN OLD;
	   END
	   $function$
	   ;`);

        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.log_create()
		 RETURNS trigger
		 LANGUAGE plpgsql
		AS $function$ 
			   BEGIN
				   IF OLD.pin IS NULL
				   THEN
					   INSERT INTO ${schemaName}.pin_audit_log 
					   (pin,pid,parcel_status,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action) 
					   VALUES (NEW.pin,NEW.pid,NEW.parcel_status,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,NEW.created_at,'C');
				   ELSE
				   INSERT INTO ${schemaName}.pin_audit_log 
				   (pin,pid,parcel_status,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,ACTION,expired_at) 
				   VALUES (NEW.pin,NEW.pid,NEW.parcel_status,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,NEW.created_at,'R',now());
				   END IF;
				   
				   RETURN NEW;
			   END
			   $function$
		;`);
    }
}
