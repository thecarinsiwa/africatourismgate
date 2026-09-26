import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

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
}
