import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  StaffNotificationPayload,
  StaffNotificationPriority,
  StaffNotificationType,
} from '@africatourismgate/types';

export class StaffNotificationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({
    enum: [
      'booking_pending_approval',
      'booking_client_message',
      'review_pending',
      'support_ticket_open',
    ],
  })
  type!: StaffNotificationType;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { href: '/reservations', priority: 'high' },
  })
  payload!: StaffNotificationPayload;

  @ApiPropertyOptional({ nullable: true, type: String })
  readAt!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class StaffNotificationsUnreadCountDto {
  @ApiProperty()
  count!: number;
}

export type { StaffNotificationPayload, StaffNotificationPriority };
