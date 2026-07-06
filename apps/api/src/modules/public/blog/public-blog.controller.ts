import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicBlogPostsListQueryDto } from './dto/public-blog-posts-list-query.dto';
import { PublicBlogService } from './public-blog.service';

@ApiTags('public')
@Controller('public')
export class PublicBlogController {
  constructor(private readonly service: PublicBlogService) {}

  @Public()
  @Get('blog')
  @ApiOperation({ summary: 'List published blog posts' })
  list(@Query() query: PublicBlogPostsListQueryDto) {
    return this.service.list(query);
  }

  @Public()
  @Get('blog/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  getBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.service.getBySlug(slug, locale);
  }
}
