import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicBlogComment, PublicBlogEngagement } from '@africatourismgate/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
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
  @UseGuards(OptionalJwtAuthGuard)
  @Get('blog/:slug/engagement')
  @ApiOperation({
    summary:
      'Get reactions and comments for a published blog post (viewer reaction when authenticated)',
  })
  @ApiOkResponse({ description: 'Engagement payload' })
  getEngagement(
    @Param('slug') slug: string,
    @CurrentUser() user?: AuthUserDto,
  ): Promise<PublicBlogEngagement> {
    return this.service.getEngagement(slug, user?.id);
  }

  @Post('blog/:slug/reactions')
  @ApiOperation({
    summary: 'Toggle or change the authenticated user reaction on a published blog post',
  })
  upsertReaction(
    @Param('slug') slug: string,
    @Body() body: UpsertBlogReactionDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<PublicBlogEngagement> {
    return this.service.upsertReaction(slug, body, user.id);
  }

  @Post('blog/:slug/comments')
  @ApiOperation({ summary: 'Post a comment as the authenticated user' })
  createComment(
    @Param('slug') slug: string,
    @Body() body: CreateBlogCommentDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<PublicBlogComment> {
    return this.service.createComment(slug, body, user);
  }
}
