import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

@Entity('mobile_money_countries')
export class MobileMoneyCountries extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'organization_id', length: 36 })
  organizationId!: string;

  @Column({ type: 'char', name: 'code', length: 2 })
  code!: string;

  @Column({ type: 'varchar', name: 'name', length: 120 })
  name!: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;
}
