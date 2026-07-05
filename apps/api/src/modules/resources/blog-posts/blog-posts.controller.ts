import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsListQueryDto } from './dto/blog-posts-list-query.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@ApiTags('blog-posts')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly service: BlogPostsService) {}

  @RequirePermissions('blog.read')
  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  findAll(@Query() query: BlogPostsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('blog.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get blog post by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('blog.write')
  @Post()
  @ApiOperation({ summary: 'Create blog post' })
  create(@Body() dto: CreateBlogPostDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('blog.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update blog post' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('blog.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete blog post' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
