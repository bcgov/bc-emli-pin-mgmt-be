import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1692885948038 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS log_created_at timestamp WITH time ZONE NOT NULL DEFAULT now();`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN pin DROP NOT NULL;`,
        );
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
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS re_create_active_pin ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(
            `CREATE TRIGGER re_create_active_pin AFTER UPDATE OF pin ON ${schemaName}.active_pin FOR EACH ROW EXECUTE PROCEDURE ${schemaName}.log_create();`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS re_create_active_pin ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS ${schemaName}.log_create();`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS log_created_at;`,
        );
    }
}
