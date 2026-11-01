import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type BlogCommentStatus = 'pending' | 'approved' | 'rejected';

@Entity('blog_comments')
export class BlogComments extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'char', name: 'blog_post_id', length: 36 })
  blogPostId!: string;

  @Column({ type: 'varchar', name: 'author_name', length: 120 })
  authorName!: string;

  @Column({ type: 'varchar', name: 'author_email', length: 255, nullable: true })
  authorEmail!: string | null;

  @Column({ type: 'text', name: 'body' })
  body!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  })
  status!: BlogCommentStatus;

  @Column({ type: 'varchar', name: 'visitor_key', length: 64, nullable: true })
  visitorKey!: string | null;
}
