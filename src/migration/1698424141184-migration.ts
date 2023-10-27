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
    }
}
