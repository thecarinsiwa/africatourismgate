import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateBookingMessageDto {
  @ApiProperty({ minLength: 1, description: 'Message body' })
  @IsString()
  @MinLength(1)
  body!: string;
}
