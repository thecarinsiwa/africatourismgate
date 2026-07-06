import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type WhyUsItemStatus = 'draft' | 'published';

@Entity('why_us_sections')
export class WhyUsSections extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'subtitle' })
  subtitle!: string;

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
