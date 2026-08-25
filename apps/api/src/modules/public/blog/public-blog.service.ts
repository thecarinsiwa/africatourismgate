import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { BlogPosts } from '../../../entities/blog-post.entity';
import {
  groupBlogPostsByTranslationKey,
  pickBlogPostForLocale,
} from './blog-locale.util';
import { PublicBlogPostsListQueryDto } from './dto/public-blog-posts-list-query.dto';

export type PublicBlogPostListItemDto = {
  id: string;
  title: string;
  slug: string;
  translationKey: string;
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

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(post.title LIKE :term OR post.excerpt LIKE :term OR post.translationKey LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('post.publishedAt', 'DESC');

    const allPublished = await qb.getMany();
    const groups = groupBlogPostsByTranslationKey(allPublished);
    const localized = [...groups.values()]
      .map((siblings) => pickBlogPostForLocale(siblings, query.locale))
      .filter((post): post is BlogPosts => post !== null)
      .sort((a, b) => {
        const aTime = a.publishedAt?.getTime() ?? 0;
        const bTime = b.publishedAt?.getTime() ?? 0;
        return bTime - aTime;
      });

    const total = localized.length;
    const offset = (page - 1) * limit;
    const posts = localized.slice(offset, offset + limit);

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
    const anchor = await this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NULL')
      .andWhere('post.slug = :slug', { slug })
      .andWhere('post.status = :status', { status: 'published' })
      .andWhere('post.publishedAt IS NOT NULL')
      .andWhere('post.publishedAt <= :now', { now: new Date() })
      .getOne();

    if (!anchor) {
      throw new NotFoundException(`Blog post "${slug}" not found`);
    }

    const siblings = await this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NULL')
      .andWhere('post.translationKey = :translationKey', {
        translationKey: anchor.translationKey,
      })
      .andWhere('post.status = :status', { status: 'published' })
      .andWhere('post.publishedAt IS NOT NULL')
      .andWhere('post.publishedAt <= :now', { now: new Date() })
      .getMany();

    const post = pickBlogPostForLocale(siblings, locale);
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
      translationKey: post.translationKey,
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
