import { Column, Entity, Index } from 'typeorm';

@Index('vhers_audit_log_pkey', ['logId'], { unique: true })
@Entity('vhers_audit_log')
export class VhersAuditLog {
    @Column('uuid', {
        primary: true,
        name: 'log_id',
        default: () => 'uuid_generate_v4()',
    })
    logId: string;

    @Column('real', { name: 'response_time_ms', precision: 24 })
    responseTimeMs: number;

    @Column('character varying', { name: 'endpoint_name' })
    endpointName: string;

    @Column('integer', { name: 'status_code' })
    statusCode: number;

    @Column('timestamp with time zone', {
        name: 'created_at',
        default: () => 'now()',
    })
    createdAt: Date;

    @Column('json', { name: 'request_body', nullable: true })
    requestBody: object | null;

    @Column('json', { name: 'response_body', nullable: true })
    responseBody: object | null;
}
