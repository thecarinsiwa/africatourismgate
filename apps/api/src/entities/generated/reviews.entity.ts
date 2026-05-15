import { Entity, Column, PrimaryColumn } from 'typeorm';
import { BaseAuditEntity } from '../../common/entities/base-audit.entity';
@Entity('reviews')
export class Reviews extends BaseAuditEntity {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ name: 'entity_type', enum: ["property","flight","vehicle","cruise","activity","booking"] })
  entityType!: 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity' | 'booking';

  @Column({ type: 'varchar', name: 'entity_id', length: 36 })
  entityId!: string;

  @Column({ type: 'int', name: 'rating' })
  rating!: number;

  @Column({ type: 'varchar', name: 'title', length: 180, nullable: true })
  title!: string;

  @Column({ type: 'text', name: 'body', nullable: true })
  body!: string;

}