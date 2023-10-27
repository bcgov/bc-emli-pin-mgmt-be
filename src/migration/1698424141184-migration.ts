import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1698424141184 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN given_name TYPE VARCHAR(125);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN altered_by_user_guid;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN altered_by_name VARCHAR(201);`,
        );
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS re_create_active_pin ON ${schemaName}.active_pin;`,
        );

        await queryRunner.query(`CREATE OR REPLACE FUNCTION public.log_create()
		RETURNS trigger
		LANGUAGE plpgsql
	   AS $function$ 
					  BEGIN
						  IF OLD.pin IS NULL
						  THEN
							  INSERT INTO public.pin_audit_log 
							  (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action) 
							  VALUES (NEW.pin,NEW.pids,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,now(),'C');
						  ELSE
						  INSERT INTO public.pin_audit_log 
							  (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action) 
							  VALUES (NEW.pin,NEW.pids,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,now(),'R');
						  END IF;
						  
						  RETURN NEW;
					  END
					  $function$
	   ;`);
        await queryRunner.query(
            `CREATE TRIGGER re_create_active_pin AFTER UPDATE OF pin ON active_pin FOR EACH ROW EXECUTE PROCEDURE log_create();`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN given_name TYPE VARCHAR(50);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN altered_by_user_guid varchar(36);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN altered_by_name;`,
        );
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS re_create_active_pin ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(`CREATE OR REPLACE FUNCTION public.log_create()
 		RETURNS trigger
 		LANGUAGE plpgsql
		AS $function$ 
			   BEGIN
				   IF OLD.pin IS NULL
				   THEN
					   INSERT INTO public.pin_audit_log 
					   (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action) 
					   VALUES (NEW.pin,NEW.pids,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,now(),'C');
				   ELSE
				    INSERT INTO public.pin_audit_log 
				   (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,ACTION,expired_at) 
				   VALUES (OLD.pin,OLD.pids,OLD.title_number,OLD.land_title_district,OLD.from_title_number,OLD.from_land_title_district,OLD.title_status,OLD.live_pin_id,'R',now());
				   INSERT INTO public.pin_audit_log 
					   (pin,pids,title_number,land_title_district,from_title_number,from_land_title_district,title_status,live_pin_id,pin_created_at,action) 
					   VALUES (NEW.pin,NEW.pids,NEW.title_number,NEW.land_title_district,NEW.from_title_number,NEW.from_land_title_district,NEW.title_status,NEW.live_pin_id,now(),'R');
				   END IF;
				   
				   RETURN NEW;
			   END
			   $function$
		;`);
        await queryRunner.query(
            `CREATE TRIGGER re_create_active_pin AFTER UPDATE OF pin ON active_pin FOR EACH ROW EXECUTE PROCEDURE log_create();`,
        );
    }
}
