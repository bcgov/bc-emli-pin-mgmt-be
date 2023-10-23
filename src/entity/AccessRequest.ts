import { Column, Entity, Index } from 'typeorm';

@Index('access_request_pkey', ['requestId'], { unique: true })
@Entity('access_request')
export class AccessRequest {
    @Column('uuid', {
        primary: true,
        name: 'request_id',
        default: () => 'uuid_generate_v4()',
    })
    requestId: string;

    @Column('character varying', { name: 'user_guid', length: 36 })
    userGuid: string;

    @Column('character varying', { name: 'identity_type', length: 20 })
    identityType: string;

    @Column('enum', {
        name: 'requested_role',
        enum: ['Standard', 'Admin', 'SuperAdmin'],
    })
    requestedRole: 'Standard' | 'Admin' | 'SuperAdmin';

    @Column('character varying', { name: 'organization', length: 100 })
    organization: string;

    @Column('citext', { name: 'email' })
    email: string;

    @Column('character varying', { name: 'user_name', length: 50 })
    userName: string;

    @Column('character varying', { name: 'given_name', length: 50 })
    givenName: string;

    @Column('character varying', { name: 'last_name', length: 75 })
    lastName: string;

    @Column('enum', {
        name: 'request_status',
        enum: ['NotGranted', 'Granted', 'Rejected'],
    })
    requestStatus: 'NotGranted' | 'Granted' | 'Rejected';

    @Column('timestamp with time zone', {
        name: 'created_at',
        default: () => 'now()',
    })
    createdAt: Date;

    @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
    updatedAt: Date | null;

    @Column('character varying', {
        name: 'updated_by',
        nullable: true,
        length: 75,
    })
    updatedBy: string | null;

    @Column('text', { name: 'request_reason', nullable: true })
    requestReason: string | null;

    @Column('text', { name: 'rejection_reason', nullable: true })
    rejectionReason: string | null;
}
