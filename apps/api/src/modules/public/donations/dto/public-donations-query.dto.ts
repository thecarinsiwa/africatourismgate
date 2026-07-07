import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class PublicDonationsQueryDto {
  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ enum: ['web', 'gap'] })
  @IsOptional()
  @IsEnum(['web', 'gap'])
  surface?: 'web' | 'gap';
}
