import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type StaffNotificationType =
  | 'booking_pending_approval'
  | 'booking_client_message'
  | 'review_pending'
  | 'support_ticket_open';

export type StaffNotificationPriority = 'high' | 'normal' | 'low';

export type StaffNotificationPayload = {
  href: string;
  priority: StaffNotificationPriority;
  bookingId?: string;
  messageId?: string;
  reviewId?: string;
  ticketId?: string;
  authorName?: string;
  status?: string;
  amountCents?: number;
  currency?: string;
};

@Entity('notifications')
export class Notifications {
  @PrimaryColumn('uuid', { name: 'id', length: 36 })
  id!: string;

  @Column({ type: 'varchar', name: 'user_id', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', name: 'type', length: 64 })
  type!: StaffNotificationType;

  @Column({ type: 'json', name: 'payload' })
  payload!: StaffNotificationPayload;

  @Column({ type: 'datetime', name: 'read_at', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
