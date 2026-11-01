import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogComments } from '../../../entities/blog-comment.entity';
import { BlogPostReactions } from '../../../entities/blog-post-reaction.entity';
import { BlogPosts } from '../../../entities/blog-post.entity';
import { PublicBlogController } from './public-blog.controller';
import { PublicBlogService } from './public-blog.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPosts, BlogPostReactions, BlogComments]),
  ],
  controllers: [PublicBlogController],
  providers: [PublicBlogService],
  exports: [PublicBlogService],
})
export class PublicBlogModule {}
