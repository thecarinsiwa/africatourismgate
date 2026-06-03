import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ maxLength: 255, example: 'Question sur ma réservation' })
  @IsString()
  @MaxLength(255)
  subject!: string;

  @ApiProperty({
    description: 'Initial customer message (required for end-user submissions)',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  body!: string;

  @ApiPropertyOptional({
    description: 'Target user (staff only). Defaults to the authenticated user.',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
