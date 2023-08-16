import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1692035353629 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
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
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS log_expiration ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(`CREATE TRIGGER log_expiration BEFORE DELETE ON
		   ${schemaName}.active_pin FOR EACH ROW EXECUTE FUNCTION ${schemaName}.log_expiration();`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS log_expiration ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS ${schemaName}.log_expiration();`,
        );
    }
}
