import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701465513423 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}."vhers_audit_log" (
			log_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
			response_time_ms REAL NOT NULL,
			endpoint_name VARCHAR NOT NULL,
			status_code INTEGER NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			request_body JSON,
			response_body JSON
		);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(
            `DROP TABLE IF EXISTS ${schemaName}."vhers_audit_log";`,
        );
    }
}
