import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1698348320098 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN title_status TYPE VARCHAR(1)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.pin_audit_log ALTER COLUMN title_status TYPE title_status_type`,
        );
    }
}
