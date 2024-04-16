import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1713283059384 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // create valid pid table
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."valid_pid" (
        id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        pid INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        // drop access_request table
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."valid_pid"`,
        );
    }
}
