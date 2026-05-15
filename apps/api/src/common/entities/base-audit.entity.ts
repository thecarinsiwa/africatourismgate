import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

/** Audit + soft-delete columns present on all business tables */
export abstract class BaseAuditEntity {
  @Column({ name: 'created_by_user_id', type: 'char', length: 36, nullable: true })
  createdByUserId!: string | null;

  @Column({ name: 'updated_by_user_id', type: 'char', length: 36, nullable: true })
  updatedByUserId!: string | null;

  @Column({ name: 'deleted_by_user_id', type: 'char', length: 36, nullable: true })
  deletedByUserId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt!: Date | null;
}
