import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type DonationStatus = 'draft' | 'published';

@Entity('donations')
export class Donations extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'context_note', length: 255, nullable: true })
  contextNote!: string | null;

  @Column({ type: 'varchar', name: 'button_label', length: 120 })
  buttonLabel!: string;

  @Column({ type: 'varchar', name: 'url', length: 512 })
  url!: string;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;

  @Column({ name: 'show_on_web', type: 'boolean', default: true })
  showOnWeb!: boolean;

  @Column({ name: 'show_on_gap', type: 'boolean', default: true })
  showOnGap!: boolean;

  @Column({ name: 'is_navbar_featured', type: 'boolean', default: false })
  isNavbarFeatured!: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: DonationStatus;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;
}
