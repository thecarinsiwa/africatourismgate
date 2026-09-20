import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type LegalPageSectionKey = 'terms-of-use';

export type LegalPageStatus = 'draft' | 'published';

@Entity('legal_pages')
export class LegalPages extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({
    name: 'section_key',
    type: 'enum',
    enum: ['terms-of-use'],
  })
  sectionKey!: LegalPageSectionKey;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'longtext', name: 'content' })
  content!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: LegalPageStatus;

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
