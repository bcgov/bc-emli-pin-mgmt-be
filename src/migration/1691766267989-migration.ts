import { MigrationInterface, QueryRunner } from 'typeorm';
import 'dotenv/config';

export class Migration1691766267989 implements MigrationInterface {
    /*
		Adding in update column triggers and relevant column edits
	 */
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // Trigger function
        await queryRunner.query(`CREATE OR REPLACE FUNCTION ${schemaName}.update_column()   
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = now();
			RETURN NEW;   
		END;
		$$ language 'plpgsql';`);

        // Column updates
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN expired_at TYPE timestamp WITH TIME ZONE;`,
        );
        // await queryRunner.query(
        //     `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN expired_at SET DEFAULT now();`,
        // );
        // await queryRunner.query(
        //     `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN expired_at SET NOT NULL;`,
        // );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS pin_created_at timestamp WITH time ZONE NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS updated_at timestamp WITH time zone;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS expired_by_name varchar(75);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS expired_by_username varchar(75);`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS live_pin_id UUID NOT NULL;`,
        );
        /* Action type column
         * The reason for adding an entry to the pin audit log.
         * - Deleted PIN  = 'D',
         * - (Initially) Created PIN = 'C',
         * - Recreated (expire and create) PIN = 'R'
         */
        await queryRunner.query(
            `DROP TYPE IF EXISTS ${schemaName}.pin_audit_action_type`,
        );
        await queryRunner.query(
            `CREATE TYPE ${schemaName}.pin_audit_action_type AS ENUM ('D', 'C', 'R');`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ADD COLUMN IF NOT EXISTS action ${schemaName}.pin_audit_action_type NOT NULL;`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}."permission" ADD COLUMN IF NOT EXISTS updated_at timestamp WITH time zone;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}."permission" ADD COLUMN IF NOT EXISTS created_at timestamp WITH time ZONE NOT NULL DEFAULT now();`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ADD COLUMN IF NOT EXISTS updated_at timestamp WITH time zone;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ADD COLUMN IF NOT EXISTS created_at timestamp WITH time ZONE NOT NULL DEFAULT now();`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN updated_at TYPE timestamp WITH TIME ZONE;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN created_at TYPE timestamp WITH TIME ZONE;`,
        );

        // Add triggers to table
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_active_pin ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(
            `CREATE TRIGGER update_active_pin BEFORE UPDATE ON ${schemaName}.active_pin FOR EACH ROW EXECUTE PROCEDURE ${schemaName}.update_column();`,
        );

        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_permission ON ${schemaName}."permission";`,
        );
        await queryRunner.query(
            `CREATE TRIGGER update_permission BEFORE UPDATE ON ${schemaName}."permission" FOR EACH ROW EXECUTE PROCEDURE ${schemaName}.update_column();`,
        );

        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_users ON ${schemaName}.users;`,
        );
        await queryRunner.query(
            `CREATE TRIGGER update_users BEFORE UPDATE ON ${schemaName}.users FOR EACH ROW EXECUTE PROCEDURE ${schemaName}.update_column();`,
        );

        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_pin_audit_log ON ${schemaName}.pin_audit_log;`,
        );
        await queryRunner.query(
            `CREATE TRIGGER update_pin_audit_log BEFORE UPDATE ON ${schemaName}.pin_audit_log FOR EACH ROW EXECUTE PROCEDURE ${schemaName}.update_column();`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';

        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_pin_audit_log ON ${schemaName}.pin_audit_log;`,
        );
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_users ON ${schemaName}.users;`,
        );
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_permission ON ${schemaName}."permission";`,
        );
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS update_active_pin ON ${schemaName}.active_pin;`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN expired_at DROP NOT NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN expired_at TYPE timestamp;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN expired_at DROP DEFAULT;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS updated_at;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS expired_by_name;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS expired_by_username;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log DROP COLUMN IF EXISTS live_pin_id;`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}."permission" DROP COLUMN IF EXISTS updated_at;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}."permission" DROP COLUMN IF EXISTS created_at;`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users DROP COLUMN IF NOT EXISTS updated_at timestamp WITH time zone;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users DROP COLUMN IF NOT EXISTS created_at timestamp WITH time ZONE NOT NULL DEFAULT now();`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN updated_at TYPE timestamp;`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.active_pin ALTER COLUMN created_at TYPE timestamp;`,
        );

        await queryRunner.query(
            `DROP FUNCTION IF EXISTS ${schemaName}.update_column();`,
        );
    }
}
