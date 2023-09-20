import { Column, Entity, Index } from 'typeorm';

@Index('users_pkey', ['userId'], { unique: true })
@Entity('users')
export class Users {
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

    @Column('citext', { name: 'email' })
    email: string;

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

    @Column('character varying', {
        name: 'updated_by',
        nullable: true,
        length: 75,
    })
    updatedBy: string | null;

    @Column('text', { name: 'deactivation_reason', nullable: true })
    deactivationReason: string | null;
}
