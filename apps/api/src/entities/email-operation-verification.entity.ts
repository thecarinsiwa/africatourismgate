import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type EmailOperationPurpose =
  | 'register'
  | 'google_signup'
  | 'login'
  | 'booking';

@Entity('email_operation_verifications')
export class EmailOperationVerifications {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'email', length: 255 })
  email!: string;

  @Column({
    name: 'purpose',
    type: 'enum',
    enum: ['register', 'google_signup', 'login', 'booking'],
  })
  purpose!: EmailOperationPurpose;

  @Column({ type: 'varchar', name: 'reference_id', length: 36 })
  referenceId!: string;

  @Column({ type: 'varchar', name: 'code_hash', length: 64 })
  codeHash!: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'datetime', name: 'verified_at', nullable: true })
  verifiedAt!: Date | null;

  @Column({
    type: 'datetime',
    name: 'abandonment_reminder_sent_at',
    nullable: true,
  })
  abandonmentReminderSentAt!: Date | null;

  @Column({ type: 'json', name: 'metadata', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
