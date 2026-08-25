import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type BlogPostStatus = 'draft' | 'published';

@Entity('blog_posts')
export class BlogPosts extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'varchar', name: 'slug', length: 180 })
  slug!: string;

  @Column({ type: 'varchar', name: 'translation_key', length: 180 })
  translationKey!: string;

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
  status!: BlogPostStatus;

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
