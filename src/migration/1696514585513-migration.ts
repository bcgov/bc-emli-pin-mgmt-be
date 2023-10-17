import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1696514585513 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';

        await queryRunner.query(`
            alter table parcel_raw drop constraint if exists fk_etl;
        `);
        await queryRunner.query(`
            alter table title_raw drop constraint if exists fk_etl;
        `);
        await queryRunner.query(`
            alter table titleowner_raw drop constraint if exists fk_etl;
        `);
        await queryRunner.query(`
            alter table titleparcel_raw drop constraint if exists fk_etl;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.etl_log
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS job_status_type
        `);

        await queryRunner.query(`
            CREATE TYPE job_status_type AS ENUM ('Success', 'Failure', 'In Progress', 'Cancelled');
        `);

        await queryRunner.query(`
            CREATE TABLE public.etl_log (
                job_id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
                folder VARCHAR(264) NOT NULL,
                status job_status_type NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

        await queryRunner.query(`
            alter table parcel_raw add constraint fk_etl foreign key (etl_log_id) references etl_log(job_id) on delete cascade;
        `);
        await queryRunner.query(`
            alter table title_raw add constraint fk_etl foreign key (etl_log_id) references etl_log(job_id) on delete cascade;
        `);
        await queryRunner.query(`
            alter table titleowner_raw add constraint fk_etl foreign key (etl_log_id) references etl_log(job_id) on delete cascade;
        `);
        await queryRunner.query(`
            alter table titleparcel_raw add constraint fk_etl foreign key (etl_log_id) references etl_log(job_id) on delete cascade;
        `);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_column()   
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;   
            END;
            $$ language 'plpgsql';
        `);
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_etl_log ON etl_log;
        `);
        await queryRunner.query(`
            CREATE TRIGGER update_etl_log BEFORE UPDATE ON etl_log FOR EACH ROW EXECUTE PROCEDURE update_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = process.env.NODE_ENV === 'test' ? 'test' : 'public';

        await queryRunner.query(`
            alter table parcel_raw drop constraint if exists fk_etl;
        `);
        await queryRunner.query(`
            alter table title_raw drop constraint if exists fk_etl;
        `);
        await queryRunner.query(`
            alter table titleowner_raw drop constraint if exists fk_etl;
        `);
        await queryRunner.query(`
            alter table titleparcel_raw drop constraint if exists fk_etl;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS ${schemaName}.etl_log
        `);
        await queryRunner.query(`
            DROP TYPE IF EXISTS job_status_type
        `);
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_etl_log ON etl_log;
        `);
    }
}
