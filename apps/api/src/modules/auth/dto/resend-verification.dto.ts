import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ description: 'Current verification record ID from the verify page URL' })
  @IsString()
  @MinLength(1)
  verificationId!: string;
}

export class ResendVerificationResponseDto {
  @ApiProperty({ description: 'New verification id — replace the one in the client URL' })
  verificationId!: string;

  @ApiProperty({ example: 'Un nouveau code a été envoyé.' })
  message!: string;
}
