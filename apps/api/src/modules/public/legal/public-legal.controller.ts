import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { LegalPageSectionKey } from '../../../entities/legal-page.entity';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicLegalPagesListQueryDto } from './dto/public-legal-pages-list-query.dto';
import { PublicLegalService } from './public-legal.service';

const SECTION_KEYS = new Set<LegalPageSectionKey>(['terms-of-use']);

function parseSectionKey(value: string): LegalPageSectionKey {
  if (!SECTION_KEYS.has(value as LegalPageSectionKey)) {
    throw new BadRequestException(`Invalid legal page section key: ${value}`);
  }
  return value as LegalPageSectionKey;
}

@ApiTags('public')
@Controller('public')
export class PublicLegalController {
  constructor(private readonly service: PublicLegalService) {}

  @Public()
  @Get('legal-pages')
  @ApiOperation({ summary: 'List published legal pages' })
  listPages(@Query() query: PublicLegalPagesListQueryDto) {
    return this.service.listPages(query);
  }

  @Public()
  @Get('legal-pages/:sectionKey')
  @ApiOperation({ summary: 'Get published legal page by section key' })
  getPageBySectionKey(
    @Param('sectionKey') sectionKey: string,
    @Query('locale') locale?: string,
  ) {
    return this.service.getPageBySectionKey(parseSectionKey(sectionKey), locale);
  }
}
