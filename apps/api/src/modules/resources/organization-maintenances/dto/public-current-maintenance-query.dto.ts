import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PublicCurrentMaintenanceQueryDto {
  @ApiPropertyOptional({
    description: 'Organization slug (defaults to the platform organization)',
    example: 'africa-tourism-gate',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationSlug?: string;

  @ApiPropertyOptional({
    description: 'UI locale (fr | en | es). Falls back to fr, then any active window.',
    example: 'fr',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
