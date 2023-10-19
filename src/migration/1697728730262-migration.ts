import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1697728730262 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.access_request ALTER COLUMN identity_type TYPE VARCHAR(20)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.access_request ALTER COLUMN organization TYPE VARCHAR(100)`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN identity_type TYPE VARCHAR(20)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN organization TYPE VARCHAR(100)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.access_request ALTER COLUMN identity_type TYPE VARCHAR(10)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.access_request ALTER COLUMN organization TYPE VARCHAR(50)`,
        );

        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN identity_type TYPE VARCHAR(10)`,
        );
        await queryRunner.query(
            `ALTER TABLE IF EXISTS ${schemaName}.users ALTER COLUMN organization TYPE VARCHAR(50)`,
        );
    }
}
