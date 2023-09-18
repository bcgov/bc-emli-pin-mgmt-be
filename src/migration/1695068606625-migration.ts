import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695068606625 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.add_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $function$
          BEGIN
            IF new.request_status = 'Granted'
            THEN
              INSERT INTO ${schemaName}.users
              (user_guid,identity_type,role,organization,email,user_name,given_name,last_name,is_active,created_at)
              VALUES (new.user_guid,new.identity_type,new.requested_role,new.organization,new.email,new.user_name,new.given_name,new.last_name,true,now());
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
        // drop function add new user
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS ${schemaName}.add_new_user();`,
        );
    }
}
