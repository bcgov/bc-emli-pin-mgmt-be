import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695062455312 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fixing migrations to be for the employee table
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // adding column updated by
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.employee ADD COLUMN IF NOT EXISTS updated_by varchar(75);`,
        );
        // adding column for deactivation reason
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.employee ADD COLUMN IF NOT EXISTS deactivation_reason text;`,
        );

        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.add_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $function$
          BEGIN
            IF new.request_status = 'Granted'
            THEN
              INSERT INTO ${schemaName}.employee
              (user_guid,identity_type,role,organization,email,user_name,first_name,last_name,is_active ,created_at)
              VALUES (new.user_guid,new.identity_type,new.requested_role,new.organization,new.email,new.user_name,new.first_name,new.last_name,true,now());
            END IF;
            RETURN NEW;

          END;
        $function$
        ;`);

        // Add trigger for request status update
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_request_status ON ${schemaName}.access_request;`,
        );
        await queryRunner.query(`CREATE TRIGGER update_request_status AFTER UPDATE OF request_status ON
      ${schemaName}.access_request FOR EACH ROW EXECUTE FUNCTION ${schemaName}.add_new_user();`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // delete updated by column for rollback
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.employee DROP COLUMN IF EXISTS updated_by;`,
        );
        // delete deactivation reason column for rollback.
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.employee DROP COLUMN IF EXISTS deactivation_reason;`,
        );
        // drop function add new user
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS ${schemaName}.add_new_user();`,
        );
    }
}
