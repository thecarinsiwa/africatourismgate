import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { GapPageSectionKey } from '../../../entities/gap-page.entity';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicGapLocaleQueryDto } from './dto/public-gap-locale-query.dto';
import { PublicGapMediaListQueryDto } from './dto/public-gap-media-list-query.dto';
import { PublicGapPagesListQueryDto } from './dto/public-gap-pages-list-query.dto';
import { PublicGapService } from './public-gap.service';

const SECTION_KEYS = new Set<GapPageSectionKey>(['about', 'objectives', 'unesco']);

function parseSectionKey(value: string): GapPageSectionKey {
  if (!SECTION_KEYS.has(value as GapPageSectionKey)) {
    throw new BadRequestException(`Invalid GAP page section key: ${value}`);
  }
  return value as GapPageSectionKey;
}

@ApiTags('public')
@Controller('public/gap')
export class PublicGapController {
  constructor(private readonly service: PublicGapService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get published GAP homepage content (settings + impact stats)' })
  getHome(@Query() query: PublicGapLocaleQueryDto) {
    return this.service.getHomeContent(query);
  }

  @Public()
  @Get('pages')
  @ApiOperation({ summary: 'List published GAP pages' })
  listPages(@Query() query: PublicGapPagesListQueryDto) {
    return this.service.listPages(query);
  }

  @Public()
  @Get('pages/:sectionKey')
  @ApiOperation({ summary: 'Get published GAP page by section key' })
  getPageBySectionKey(
    @Param('sectionKey') sectionKey: string,
    @Query('locale') locale?: string,
  ) {
    return this.service.getPageBySectionKey(parseSectionKey(sectionKey), locale);
  }

  @Public()
  @Get('activities')
  @ApiOperation({ summary: 'List published GAP activities' })
  listActivities(@Query() query: PublicGapLocaleQueryDto) {
    return this.service.listActivities(query);
  }

  @Public()
  @Get('media')
  @ApiOperation({ summary: 'List published GAP media items' })
  listMedia(@Query() query: PublicGapMediaListQueryDto) {
    return this.service.listMedia(query);
  }
}
