import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

export class VerifyOperationDto {
  @ApiProperty({ description: 'Verification record ID from the alert email' })
  @IsString()
  verificationId!: string;

  @ApiProperty({ example: '482916', description: '6-digit code from email' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;

  @ApiPropertyOptional({
    description: 'Stable browser profile id — one active session per profile',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', {
    message: "L'identifiant d'instance client doit être un UUID valide.",
  })
  clientInstanceId?: string;
}

export class VerifyOperationResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiPropertyOptional({ description: 'Purpose that was verified' })
  purpose?: string;

  @ApiPropertyOptional({ description: 'Reference ID (user or booking)' })
  referenceId?: string;
}
