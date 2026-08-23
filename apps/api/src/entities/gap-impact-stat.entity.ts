import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type GapImpactStatColorKey = 'primary' | 'secondary';
export type GapImpactStatStatus = 'draft' | 'published';

@Entity('gap_impact_stats')
export class GapImpactStats extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'label', length: 120 })
  label!: string;

  @Column({ type: 'varchar', name: 'value_display', length: 64 })
  valueDisplay!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'image_url', length: 1024, nullable: true })
  imageUrl!: string | null;

  @Column({
    name: 'color_key',
    type: 'enum',
    enum: ['primary', 'secondary'],
    default: 'primary',
  })
  colorKey!: GapImpactStatColorKey;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: GapImpactStatStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
