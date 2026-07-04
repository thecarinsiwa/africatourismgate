import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingMessageDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  bookingId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  userId!: string | null;

  @ApiProperty()
  body!: string;

  @ApiProperty({ description: 'True when posted by staff (admin/agent)' })
  isStaff!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({
    description: 'True when a staff reply triggered an offline email notification to the customer.',
  })
  customerNotifiedByEmail?: boolean;
}

export class BookingMessagesListDto {
  @ApiProperty({ type: [BookingMessageDto] })
  messages!: BookingMessageDto[];
}
