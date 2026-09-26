import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AttachFundExitBookingsDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
    description: 'Booking ids to attach (0,N). Existing links are kept.',
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  bookingIds!: string[];
}
