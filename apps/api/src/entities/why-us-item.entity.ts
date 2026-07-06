import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type WhyUsIconKey = 'globe' | 'search' | 'booking' | 'support';
export type WhyUsItemStatus = 'draft' | 'published';

@Entity('why_us_items')
export class WhyUsItems extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'title', length: 160 })
  title!: string;

  @Column({ type: 'text', name: 'description' })
  description!: string;

  @Column({ type: 'varchar', name: 'link_url', length: 512 })
  linkUrl!: string;

  @Column({
    name: 'icon_key',
    type: 'enum',
    enum: ['globe', 'search', 'booking', 'support'],
    default: 'globe',
  })
  iconKey!: WhyUsIconKey;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: WhyUsItemStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
