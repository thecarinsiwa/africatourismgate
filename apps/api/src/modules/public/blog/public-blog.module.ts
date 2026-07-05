import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPosts } from '../../../entities/blog-post.entity';
import { PublicBlogController } from './public-blog.controller';
import { PublicBlogService } from './public-blog.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPosts])],
  controllers: [PublicBlogController],
  providers: [PublicBlogService],
})
export class PublicBlogModule {}
