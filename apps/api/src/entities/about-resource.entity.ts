import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type AboutResourceType = 'financial' | 'media';
export type AboutResourceStatus = 'draft' | 'published';

@Entity('about_resources')
export class AboutResources extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['financial', 'media'],
  })
  type!: AboutResourceType;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'file_url', length: 512, nullable: true })
  fileUrl!: string | null;

  @Column({ type: 'varchar', name: 'external_url', length: 512, nullable: true })
  externalUrl!: string | null;

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
  status!: AboutResourceStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
