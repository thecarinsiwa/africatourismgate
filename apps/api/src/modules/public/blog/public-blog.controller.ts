import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicBlogComment, PublicBlogEngagement } from '@africatourismgate/types';
import { Public } from '../../auth/decorators/public.decorator';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import { PublicBlogEngagementQueryDto } from './dto/public-blog-engagement-query.dto';
import { PublicBlogPostsListQueryDto } from './dto/public-blog-posts-list-query.dto';
import { UpsertBlogReactionDto } from './dto/upsert-blog-reaction.dto';
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

  @Public()
  @Get('blog/:slug/engagement')
  @ApiOperation({ summary: 'Get reactions and comments for a published blog post' })
  @ApiOkResponse({ description: 'Engagement payload' })
  getEngagement(
    @Param('slug') slug: string,
    @Query() query: PublicBlogEngagementQueryDto,
  ): Promise<PublicBlogEngagement> {
    return this.service.getEngagement(slug, query.visitorKey);
  }

  @Public()
  @Post('blog/:slug/reactions')
  @ApiOperation({
    summary: 'Toggle or change the visitor reaction on a published blog post',
  })
  upsertReaction(
    @Param('slug') slug: string,
    @Body() body: UpsertBlogReactionDto,
  ): Promise<PublicBlogEngagement> {
    return this.service.upsertReaction(slug, body);
  }

  @Public()
  @Post('blog/:slug/comments')
  @ApiOperation({ summary: 'Post a public comment on a published blog post' })
  createComment(
    @Param('slug') slug: string,
    @Body() body: CreateBlogCommentDto,
  ): Promise<PublicBlogComment> {
    return this.service.createComment(slug, body);
  }
}
