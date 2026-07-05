import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { BlogPosts } from '../../../entities/blog-post.entity';
import { PublicBlogPostsListQueryDto } from './dto/public-blog-posts-list-query.dto';

export type PublicBlogPostListItemDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  locale: string;
};

export type PublicBlogPostDetailDto = PublicBlogPostListItemDto & {
  content: string;
};

@Injectable()
export class PublicBlogService {
  constructor(
    @InjectRepository(BlogPosts)
    private readonly blogPostsRepository: Repository<BlogPosts>,
  ) {}

  async list(
    query: PublicBlogPostsListQueryDto,
  ): Promise<PaginatedResult<PublicBlogPostListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const qb = this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NULL')
      .andWhere('post.status = :status', { status: 'published' })
      .andWhere('post.publishedAt IS NOT NULL')
      .andWhere('post.publishedAt <= :now', { now: new Date() });

    if (query.locale) {
      qb.andWhere('post.locale = :locale', { locale: query.locale });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(post.title LIKE :term OR post.excerpt LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('post.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [posts, total] = await qb.getManyAndCount();

    return {
      data: posts.map((post) => this.toListItem(post)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getBySlug(slug: string, locale?: string): Promise<PublicBlogPostDetailDto> {
    const qb = this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NULL')
      .andWhere('post.slug = :slug', { slug })
      .andWhere('post.status = :status', { status: 'published' })
      .andWhere('post.publishedAt IS NOT NULL')
      .andWhere('post.publishedAt <= :now', { now: new Date() });

    if (locale) {
      qb.andWhere('post.locale = :locale', { locale });
    }

    const post = await qb.getOne();
    if (!post) {
      throw new NotFoundException(`Blog post "${slug}" not found`);
    }

    return this.toDetail(post);
  }

  private toListItem(post: BlogPosts): PublicBlogPostListItemDto {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      locale: post.locale,
    };
  }

  private toDetail(post: BlogPosts): PublicBlogPostDetailDto {
    return {
      ...this.toListItem(post),
      content: post.content,
    };
  }
}
