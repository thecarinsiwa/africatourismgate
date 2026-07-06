import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AboutPageSectionKey } from '../../../entities/about-page.entity';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicAboutPagesListQueryDto } from './dto/public-about-pages-list-query.dto';
import { PublicAboutResourcesListQueryDto } from './dto/public-about-resources-list-query.dto';
import { PublicTeamMembersListQueryDto } from './dto/public-team-members-list-query.dto';
import { PublicAboutService } from './public-about.service';

const SECTION_KEYS = new Set<AboutPageSectionKey>([
  'who-we-are',
  'how-we-work',
  'governance',
  'responsibility',
]);

function parseSectionKey(value: string): AboutPageSectionKey {
  if (!SECTION_KEYS.has(value as AboutPageSectionKey)) {
    throw new BadRequestException(`Invalid about page section key: ${value}`);
  }
  return value as AboutPageSectionKey;
}

@ApiTags('public')
@Controller('public')
export class PublicAboutController {
  constructor(private readonly service: PublicAboutService) {}

  @Public()
  @Get('about-pages')
  @ApiOperation({ summary: 'List published about pages' })
  listPages(@Query() query: PublicAboutPagesListQueryDto) {
    return this.service.listPages(query);
  }

  @Public()
  @Get('about-pages/:sectionKey')
  @ApiOperation({ summary: 'Get published about page by section key' })
  getPageBySectionKey(
    @Param('sectionKey') sectionKey: string,
    @Query('locale') locale?: string,
  ) {
    return this.service.getPageBySectionKey(parseSectionKey(sectionKey), locale);
  }

  @Public()
  @Get('team-members')
  @ApiOperation({ summary: 'List published team members' })
  listTeamMembers(@Query() query: PublicTeamMembersListQueryDto) {
    return this.service.listTeamMembers(query);
  }

  @Public()
  @Get('about-resources')
  @ApiOperation({ summary: 'List published about resources' })
  listResources(@Query() query: PublicAboutResourcesListQueryDto) {
    return this.service.listResources(query);
  }
}
