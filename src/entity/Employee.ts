import { Column, Entity, Index, OneToMany } from 'typeorm';
import { PinAuditLog } from './PinAuditLog';

@Index('users_pkey', ['userId'], { unique: true })
@Entity('employee')
export class Employee {
    @Column('uuid', {
        primary: true,
        name: 'user_id',
        default: () => 'uuid_generate_v4()',
    })
    userId: string;

    @Column('character varying', { name: 'user_guid', length: 36 })
    userGuid: string;

    @Column('character varying', { name: 'identity_type', length: 10 })
    identityType: string;

    @Column('enum', { name: 'role', enum: ['Standard', 'Admin', 'SuperAdmin'] })
    role: 'Standard' | 'Admin' | 'SuperAdmin';

    @Column('character varying', {
        name: 'organization',
        nullable: true,
        length: 50,
    })
    organization: string | null;

    @Column('citext', { name: 'email', nullable: true })
    email: string | null;

    @Column('character varying', {
        name: 'username',
        nullable: true,
        length: 100,
    })
    username: string | null;

    @Column('character varying', { name: 'given_name', length: 50 })
    givenName: string;

    @Column('character varying', { name: 'last_name', length: 75 })
    lastName: string;

    @Column('boolean', { name: 'is_active' })
    isActive: boolean;

    @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
    updatedAt: Date | null;

    @Column('timestamp with time zone', {
        name: 'created_at',
        default: () => 'now()',
    })
    createdAt: Date;

    @Column('character varying', { name: 'display_name', length: 125 })
    displayName: string;

    @OneToMany(() => PinAuditLog, (pinAuditLog) => pinAuditLog.alteredByUser)
    pinAuditLogs: PinAuditLog[];
    @Column('character varying', { name: 'updated_by', length: 75 })
    updatedBy: string;

    @Column('text', { name: 'deactivation_reason' })
    deactivationReason: string;
}
