import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1694660281384 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // create access status
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.access_request_status AS ENUM ('NotGranted', 'Granted', 'Rejected');`,
        );

        // create request table
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."access_request" (
        request_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        user_guid VARCHAR(36) NOT NULL,
        identity_type VARCHAR(10) NOT NULL,
        requested_role ${schemaName}.role_type NOT NULL,
        organization VARCHAR(50) NOT NULL,
        email CITEXT NOT NULL,
        user_name VARCHAR(50) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(75) NOT NULL,
        request_status ${schemaName}.access_request_status NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ,
        updated_by varchar(75),
        request_reason text,
        rejection_reason text
        );`);

        // Add triggers for update at to table
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_access_request ON ${schemaName}.access_request;`,
        );
        await queryRunner.query(
            `CREATE TRIGGER update_access_request BEFORE UPDATE ON ${schemaName}.access_request FOR EACH ROW EXECUTE PROCEDURE ${schemaName}.update_column();`,
        );

        // Add trigger for access granted to create a new user
        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.add_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        AS $function$
          BEGIN
            IF new.request_status = 'Granted'
            THEN
              INSERT INTO ${schemaName}.users
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
        // drop access_request table
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."access_request"`,
        );
        // drop type access_request_status
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.access_request_status`,
        );
        // drop function add new user
        await queryRunner.query(
            `DROP FUNCTION IF EXISTS ${schemaName}.add_new_user();`,
        );
    }
}
