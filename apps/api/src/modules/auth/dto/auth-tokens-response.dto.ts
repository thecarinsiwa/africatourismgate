import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'Short-lived JWT for API requests' })
  accessToken!: string;

  @ApiProperty({ description: 'Long-lived JWT used to obtain new access tokens' })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token lifetime in seconds',
    example: 900,
  })
  expiresIn!: number;
}

export class AuthResponseDto extends AuthTokensResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiPropertyOptional({
    description: 'True when email verification is required before continuing',
  })
  requiresVerification?: boolean;

  @ApiPropertyOptional({
    description: 'Verification record ID — enter the code from the alert email',
  })
  verificationId?: string;

  @ApiPropertyOptional({
    description: 'Booking ID when verifying a reservation operation',
  })
  bookingId?: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}
