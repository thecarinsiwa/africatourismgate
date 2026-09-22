import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PublicSiteSearchHit } from '@africatourismgate/types';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { BlogPosts } from '../../../entities/blog-post.entity';
import {
  BLOG_SITE_SEARCH_WEIGHTS,
  scoreSiteSearchTextMatch,
} from '../site-search/site-search-scoring';
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
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(post.title) LIKE :pattern
          OR LOWER(COALESCE(post.excerpt, '')) LIKE :pattern
          OR LOWER(post.content) LIKE :pattern)`,
        { pattern },
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

  /**
   * Free-text catalogue search for site-search.
   * Matches title, excerpt and content on published posts (optional locale).
   */
  async searchCatalog(
    q: string,
    limit: number,
    locale?: string | null,
  ): Promise<PublicSiteSearchHit[]> {
    const term = q.trim().toLowerCase();
    if (!term || limit < 1) return [];

    const pattern = `%${term}%`;
    const fetchLimit = Math.min(Math.max(limit * 3, limit), 60);

    const qb = this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NULL')
      .andWhere('post.status = :status', { status: 'published' })
      .andWhere('post.publishedAt IS NOT NULL')
      .andWhere('post.publishedAt <= :now', { now: new Date() })
      .andWhere(
        `(LOWER(post.title) LIKE :pattern
          OR LOWER(COALESCE(post.excerpt, '')) LIKE :pattern
          OR LOWER(post.content) LIKE :pattern)`,
        { pattern },
      );

    const localeFilter = locale?.trim();
    if (localeFilter) {
      qb.andWhere('post.locale = :locale', { locale: localeFilter });
    }

    const posts = await qb
      .orderBy('post.publishedAt', 'DESC')
      .take(fetchLimit)
      .getMany();

    if (!posts.length) return [];

    const hits: PublicSiteSearchHit[] = [];

    for (const post of posts) {
      const score = scoreSiteSearchTextMatch(term, [
        { weight: BLOG_SITE_SEARCH_WEIGHTS.title, value: post.title },
        { weight: BLOG_SITE_SEARCH_WEIGHTS.excerpt, value: post.excerpt },
        { weight: BLOG_SITE_SEARCH_WEIGHTS.content, value: post.content },
      ]);
      if (score <= 0) continue;

      hits.push({
        type: 'blog',
        id: post.slug,
        title: post.title,
        subtitle: post.excerpt?.trim() || null,
        href: `/blog/${encodeURIComponent(post.slug)}`,
        imageUrl: post.coverImageUrl,
        score,
      });
    }

    hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return hits.slice(0, limit);
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
