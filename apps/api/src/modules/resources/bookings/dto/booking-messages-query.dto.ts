import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

/** Reserved for CE-6 signed email chat links (optional JWT bypass). */
export class BookingMessagesQueryDto {
  @ApiPropertyOptional({
    description:
      'Signed chat access token from transactional email (CE-6). When implemented, allows guest access without login.',
  })
  @IsOptional()
  @IsString()
  chatToken?: string;

  @ApiPropertyOptional({
    description: 'Mark thread as read for the current user (default true).',
    enum: ['true', 'false'],
    default: 'true',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  markRead?: 'true' | 'false';
}
