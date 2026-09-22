import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminSupportTicketListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty({ enum: ['open', 'pending', 'resolved', 'closed'] })
  status!: 'open' | 'pending' | 'resolved' | 'closed';

  @ApiProperty({ enum: ['low', 'normal', 'high', 'urgent'] })
  priority!: 'low' | 'normal' | 'high' | 'urgent';

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  customerFirstName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  customerEmail!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Preview of the latest message body',
  })
  lastMessagePreview!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastMessageAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'True when the latest message was posted by staff',
  })
  lastMessageIsStaff!: boolean | null;
}
