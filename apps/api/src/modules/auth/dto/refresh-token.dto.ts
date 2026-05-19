import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT refresh token issued at login or register' })
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
