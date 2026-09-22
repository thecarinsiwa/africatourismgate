import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

@Entity('organization_maintenances')
export class OrganizationMaintenances extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'char', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'varchar', name: 'title', length: 200, nullable: true })
  title!: string | null;

  @Column({ type: 'text', name: 'message', nullable: true })
  message!: string | null;

  @Column({ name: 'enabled', type: 'boolean', default: false })
  enabled!: boolean;

  @Column({ name: 'starts_at', type: 'datetime' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'datetime', nullable: true })
  endsAt!: Date | null;
}
