import { Column, Entity, Index } from 'typeorm';
import { UserRoles } from './Users';

@Index('permission_pkey', ['permissionId'], { unique: true })
@Entity('permission')
export class Permission {
    @Column('uuid', {
        primary: true,
        name: 'permission_id',
        default: () => 'uuid_generate_v4()',
    })
    permissionId: string;

    @Column('character varying', { name: 'permission', length: 50 })
    permission: string;

    @Column('enum', { name: 'role', enum: ['Standard', 'Admin', 'SuperAdmin'] })
    role: UserRoles;

    @Column('timestamp with time zone', { name: 'updated_at', nullable: true })
    updatedAt: Date | null;

    @Column('timestamp with time zone', {
        name: 'created_at',
        default: () => 'now()',
    })
    createdAt: Date;
}
