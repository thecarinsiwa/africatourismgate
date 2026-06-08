import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSupportMessageDto {
  @ApiProperty({ description: 'Target support ticket id' })
  @IsUUID()
  ticketId!: string;

  @ApiProperty({ minLength: 10, description: 'Staff reply body' })
  @IsString()
  @MinLength(10)
  body!: string;
}
