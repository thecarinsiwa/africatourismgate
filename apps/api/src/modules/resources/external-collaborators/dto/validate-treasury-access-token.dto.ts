import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

const EXTERNAL_SCOPES = ['expense_requests.create'] as const;

export class ValidateTreasuryAccessTokenDto {
  @ApiProperty({
    description: 'Raw access token from the invite link (64 hex chars)',
    minLength: 64,
    maxLength: 64,
  })
  @IsString()
  @Length(64, 64)
  @Matches(/^[a-f0-9]{64}$/i, {
    message: 'token must be a 64-character hex string',
  })
  token!: string;

  @ApiPropertyOptional({
    enum: EXTERNAL_SCOPES,
    description: 'If set, validation fails with 403 when the scope is missing',
  })
  @IsOptional()
  @IsIn(EXTERNAL_SCOPES)
  requiredScope?: (typeof EXTERNAL_SCOPES)[number];
}
