import { ApiProperty } from '@nestjs/swagger';

export class ActivityBookingRequestResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    example:
      'Your booking request has been received. Our team will contact you shortly to confirm availability.',
  })
  message!: string;
}
