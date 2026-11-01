import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const BLOG_REACTION_TYPES = ['like', 'love', 'clap', 'wow'] as const;
export type BlogReactionType = (typeof BLOG_REACTION_TYPES)[number];

@Entity('blog_post_reactions')
export class BlogPostReactions {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'char', name: 'blog_post_id', length: 36 })
  blogPostId!: string;

  @Column({ type: 'varchar', name: 'visitor_key', length: 64 })
  visitorKey!: string;

  @Column({
    name: 'reaction_type',
    type: 'enum',
    enum: ['like', 'love', 'clap', 'wow'],
  })
  reactionType!: BlogReactionType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}
