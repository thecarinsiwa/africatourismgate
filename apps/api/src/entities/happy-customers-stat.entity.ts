import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type HappyCustomersColorKey = 'primary' | 'secondary';
export type HappyCustomersStatus = 'draft' | 'published';

@Entity('happy_customers_stats')
export class HappyCustomersStats extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'label', length: 120 })
  label!: string;

  @Column({ type: 'tinyint', name: 'percent_value', unsigned: true, default: 0 })
  percentValue!: number;

  @Column({
    name: 'color_key',
    type: 'enum',
    enum: ['primary', 'secondary'],
    default: 'primary',
  })
  colorKey!: HappyCustomersColorKey;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: HappyCustomersStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
