import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type AboutPageSectionKey =
  | 'who-we-are'
  | 'how-we-work'
  | 'governance'
  | 'responsibility';

export type AboutPageStatus = 'draft' | 'published';

@Entity('about_pages')
export class AboutPages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({
    name: 'section_key',
    type: 'enum',
    enum: ['who-we-are', 'how-we-work', 'governance', 'responsibility'],
  })
  sectionKey!: AboutPageSectionKey;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'excerpt', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'longtext', name: 'content' })
  content!: string;

  @Column({ type: 'varchar', name: 'cover_image_url', length: 512, nullable: true })
  coverImageUrl!: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: AboutPageStatus;

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
