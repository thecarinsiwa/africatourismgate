import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type GapMediaItemType = 'image' | 'video';
export type GapMediaItemStatus = 'draft' | 'published';

@Entity('gap_media_items')
export class GapMediaItems extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: ['image', 'video'],
    default: 'image',
  })
  mediaType!: GapMediaItemType;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'file_url', length: 512, nullable: true })
  fileUrl!: string | null;

  @Column({ type: 'varchar', name: 'external_url', length: 512, nullable: true })
  externalUrl!: string | null;

  @Column({ type: 'varchar', name: 'thumbnail_url', length: 512, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: GapMediaItemStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
