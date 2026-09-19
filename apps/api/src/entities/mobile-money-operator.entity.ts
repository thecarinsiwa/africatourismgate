import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

@Entity('mobile_money_operators')
export class MobileMoneyOperators extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'country_id', length: 36 })
  countryId!: string;

  @Column({ type: 'varchar', name: 'name', length: 120 })
  name!: string;

  @Column({ type: 'varchar', name: 'logo_url', length: 512, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;
}
