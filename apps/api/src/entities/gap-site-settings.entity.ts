import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../common/entities/base-audit.entity';

export type GapSiteSettingsStatus = 'draft' | 'published';

@Entity('gap_site_settings')
export class GapSiteSettings extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'title', length: 255 })
  title!: string;

  @Column({ type: 'text', name: 'subtitle' })
  subtitle!: string;

  @Column({ type: 'varchar', name: 'hero_image_url', length: 1024 })
  heroImageUrl!: string;

  @Column({ type: 'varchar', name: 'hero_image_alt', length: 255 })
  heroImageAlt!: string;

  @Column({ type: 'varchar', name: 'unesco_label', length: 160, nullable: true })
  unescoLabel!: string | null;

  @Column({ type: 'varchar', name: 'unesco_url', length: 512, nullable: true })
  unescoUrl!: string | null;

  @Column({ type: 'varchar', name: 'donate_url', length: 512, nullable: true })
  donateUrl!: string | null;

  @Column({ type: 'varchar', name: 'donate_label', length: 120, nullable: true })
  donateLabel!: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status!: GapSiteSettingsStatus;

  @Column({ type: 'varchar', name: 'locale', length: 5, default: 'fr' })
  locale!: string;
}
