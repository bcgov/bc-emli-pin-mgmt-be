import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1695912851708 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.etl_log
        `);
        await queryRunner.query(`
            DROP TYPE IF EXISTS job_status_type
        `);
        await queryRunner.query(`
            CREATE TYPE job_status_type AS ENUM ('Pass', 'Fail', 'In Progress');
        `);
        await queryRunner.query(`
            CREATE TABLE ${schemaName}.etl_log (
                job_id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
                file_name VARCHAR(264) NOT NULL,
                job_status job_status_type NOT NULL,
                date_processed TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

        await queryRunner.query(`
            ALTER TABLE title_raw DROP IF EXISTS etl_log_id;
        `);
        await queryRunner.query(`
            ALTER TABLE parcel_raw DROP IF EXISTS etl_log_id;
        `);
        await queryRunner.query(`
            ALTER TABLE titleparcel_raw DROP IF EXISTS etl_log_id;
        `);
        await queryRunner.query(`
            ALTER TABLE titleowner_raw DROP IF EXISTS etl_log_id;
        `);

        await queryRunner.query(`
            ALTER TABLE  title_raw ADD etl_log_id UUID NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE  parcel_raw ADD etl_log_id UUID NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE  titleparcel_raw ADD etl_log_id UUID NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE  titleowner_raw ADD etl_log_id UUID NOT NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE title_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);
        await queryRunner.query(`
            ALTER TABLE parcel_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);
        await queryRunner.query(`
            ALTER TABLE titleparcel_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);
        await queryRunner.query(`
            ALTER TABLE titleowner_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);

        await queryRunner.query(`
            ALTER TABLE title_raw ADD CONSTRAINT fk_etl FOREIGN KEY (etl_log_id) REFERENCES etl_log(job_id);
        `);
        await queryRunner.query(`
            ALTER TABLE parcel_raw ADD CONSTRAINT fk_etl FOREIGN KEY (etl_log_id) REFERENCES etl_log(job_id);
        `);
        await queryRunner.query(`
            ALTER TABLE titleparcel_raw ADD CONSTRAINT fk_etl FOREIGN KEY (etl_log_id) REFERENCES etl_log(job_id);
        `);
        await queryRunner.query(`
            ALTER TABLE titleowner_raw ADD CONSTRAINT fk_etl FOREIGN KEY (etl_log_id) REFERENCES etl_log(job_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';
        await queryRunner.query(`
        DROP TABLE IF EXISTS ${schemaName}.etl_log
        `);
        await queryRunner.query(`
            DROP TYPE IF EXISTS job_status_type
        `);

        await queryRunner.query(`
            ALTER TABLE title_raw DROP IF EXISTS etl_log_id;
        `);
        await queryRunner.query(`
            ALTER TABLE parcel_raw DROP IF EXISTS etl_log_id;
        `);
        await queryRunner.query(`
            ALTER TABLE titleparcel_raw DROP IF EXISTS etl_log_id;
        `);
        await queryRunner.query(`
            ALTER TABLE titleowner_raw DROP IF EXISTS etl_log_id;
        `);

        await queryRunner.query(`
            ALTER TABLE title_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);
        await queryRunner.query(`
            ALTER TABLE parcel_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);
        await queryRunner.query(`
            ALTER TABLE titleparcel_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);
        await queryRunner.query(`
            ALTER TABLE titleowner_raw DROP CONSTRAINT IF EXISTS fk_etl;
        `);
    }
}
