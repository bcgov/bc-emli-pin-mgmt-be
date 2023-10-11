import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1697046296250 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS log_expiration ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(
            `CREATE TRIGGER log_expiration BEFORE DELETE ON
		    ${schemaName}.active_pin FOR EACH ROW EXECUTE FUNCTION ${schemaName}.log_expiration();`,
        );

        await queryRunner.query(
            `DROP TRIGGER IF EXISTS re_create_active_pin ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(
            `CREATE TRIGGER re_create_active_pin AFTER UPDATE OF pin ON active_pin FOR EACH ROW EXECUTE PROCEDURE log_create();`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS log_expiration ON ${schemaName}.active_pin;`,
        );
        await queryRunner.query(
            `DROP TRIGGER IF EXISTS re_create_active_pin ON ${schemaName}.active_pin;`,
        );
    }
}
