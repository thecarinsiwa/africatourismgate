import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type GapActivityIconKey = 'school' | 'tree' | 'art' | 'park' | 'community';
export type GapActivityStatus = 'draft' | 'published';

@Entity('gap_activities')
export class GapActivities extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'title', length: 160 })
  title!: string;

  @Column({ type: 'text', name: 'description' })
  description!: string;

  @Column({
    name: 'icon_key',
    type: 'enum',
    enum: ['school', 'tree', 'art', 'park', 'community'],
    default: 'school',
  })
  iconKey!: GapActivityIconKey;

  @Column({ type: 'varchar', name: 'image_url', length: 1024, nullable: true })
  imageUrl!: string | null;

  /** Up to 10 image URLs; `imageUrl` mirrors the first entry for public cover. */
  @Column({ type: 'json', name: 'image_urls', nullable: true })
  imageUrls!: string[] | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: GapActivityStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
