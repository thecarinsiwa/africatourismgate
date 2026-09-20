import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { LegalPageSectionKey } from '../../../../entities/legal-page.entity';

const SECTION_KEYS = ['terms-of-use'] as const satisfies readonly LegalPageSectionKey[];

export class PublicLegalPagesListQueryDto {
  @ApiPropertyOptional({ enum: SECTION_KEYS })
  @IsOptional()
  @IsEnum(SECTION_KEYS)
  sectionKey?: LegalPageSectionKey;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
