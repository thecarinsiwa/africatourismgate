import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('site_page_views')
export class SitePageViews {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'visitor_id', length: 36 })
  visitorId!: string;

  @Column({ type: 'varchar', name: 'path', length: 512 })
  path!: string;

  @Column({ type: 'varchar', name: 'locale', length: 10, nullable: true })
  locale!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;
}
