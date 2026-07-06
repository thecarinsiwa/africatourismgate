import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type AboutTimelineMilestoneStatus = 'draft' | 'published';

@Entity('about_timeline_milestones')
export class AboutTimelineMilestones extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'period_label', length: 32 })
  periodLabel!: string;

  @Column({ type: 'varchar', name: 'period_title', length: 255 })
  periodTitle!: string;

  @Column({ type: 'int', name: 'period_sort_order', default: 0 })
  periodSortOrder!: number;

  @Column({ type: 'int', name: 'year' })
  year!: number;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'excerpt', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'longtext', name: 'content', nullable: true })
  content!: string | null;

  @Column({ type: 'varchar', name: 'image_url', length: 512, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'varchar', name: 'link_url', length: 512, nullable: true })
  linkUrl!: string | null;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: AboutTimelineMilestoneStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
