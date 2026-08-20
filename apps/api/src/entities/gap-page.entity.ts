import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type GapPageSectionKey = 'about' | 'objectives' | 'unesco';
export type GapPageStatus = 'draft' | 'published';

@Entity('gap_pages')
export class GapPages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({
    name: 'section_key',
    type: 'enum',
    enum: ['about', 'objectives', 'unesco'],
  })
  sectionKey!: GapPageSectionKey;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'excerpt', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'longtext', name: 'content' })
  content!: string;

  @Column({ type: 'varchar', name: 'cover_image_url', length: 512, nullable: true })
  coverImageUrl!: string | null;

  /** Up to 10 image URLs; `coverImageUrl` mirrors the first entry for public cover. */
  @Column({ type: 'json', name: 'cover_image_urls', nullable: true })
  coverImageUrls!: string[] | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: GapPageStatus;

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
