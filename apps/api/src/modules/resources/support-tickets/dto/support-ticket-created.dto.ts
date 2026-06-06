import { ApiProperty } from '@nestjs/swagger';

export class SupportTicketMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ticketId!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty()
  isStaff!: boolean;

  @ApiProperty()
  createdAt!: string;
}

export class SupportTicketDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty({ enum: ['open', 'pending', 'resolved', 'closed'] })
  status!: 'open' | 'pending' | 'resolved' | 'closed';

  @ApiProperty({ enum: ['low', 'normal', 'high', 'urgent'] })
  priority!: 'low' | 'normal' | 'high' | 'urgent';

  @ApiProperty()
  createdAt!: string;
}

export class SupportTicketCreatedDto {
  @ApiProperty({ type: SupportTicketDto })
  ticket!: SupportTicketDto;

  @ApiProperty({ type: SupportTicketMessageDto })
  initialMessage!: SupportTicketMessageDto;
}
