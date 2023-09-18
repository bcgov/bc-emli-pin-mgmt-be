import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1694657988999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // adding column updated by
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ADD COLUMN IF NOT EXISTS updated_by varchar(75);`,
        );
        // adding column for deactivation reason
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ADD COLUMN IF NOT EXISTS deactivation_reason text;`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // delete updated by column for rollback
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users DROP COLUMN IF EXISTS updated_by;`,
        );
        // delete deactivation reason column for rollback.
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users DROP COLUMN IF EXISTS deactivation_reason;`,
        );
    }
}
