import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  BlogReactionCounts,
  BlogReactionType,
  PublicBlogComment,
  PublicBlogEngagement,
  PublicSiteSearchHit,
} from '@africatourismgate/types';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { BlogComments } from '../../../entities/blog-comment.entity';
import {
  BlogPostReactions,
  type BlogReactionType as EntityReactionType,
} from '../../../entities/blog-post-reaction.entity';
import { BlogPosts } from '../../../entities/blog-post.entity';
import {
  BLOG_SITE_SEARCH_WEIGHTS,
  scoreSiteSearchTextMatch,
} from '../site-search/site-search-scoring';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import { PublicBlogPostsListQueryDto } from './dto/public-blog-posts-list-query.dto';
import { UpsertBlogReactionDto } from './dto/upsert-blog-reaction.dto';

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

function emptyReactionCounts(): BlogReactionCounts {
  return { like: 0, love: 0, clap: 0, wow: 0 };
}

@Injectable()
export class PublicBlogService {
  constructor(
    @InjectRepository(BlogPosts)
    private readonly blogPostsRepository: Repository<BlogPosts>,
    @InjectRepository(BlogPostReactions)
    private readonly reactionsRepository: Repository<BlogPostReactions>,
    @InjectRepository(BlogComments)
    private readonly commentsRepository: Repository<BlogComments>,
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
    const post = await this.findPublishedBySlug(slug, locale);
    return this.toDetail(post);
  }

  async getEngagement(
    slug: string,
    visitorKey?: string,
  ): Promise<PublicBlogEngagement> {
    const post = await this.findPublishedBySlug(slug);
    const [rows, comments] = await Promise.all([
      this.reactionsRepository.find({ where: { blogPostId: post.id } }),
      this.commentsRepository.find({
        where: {
          blogPostId: post.id,
          status: 'approved',
          deletedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
        take: 100,
      }),
    ]);

    const reactions = emptyReactionCounts();
    let viewerReaction: BlogReactionType | null = null;
    for (const row of rows) {
      reactions[row.reactionType] += 1;
      if (visitorKey && row.visitorKey === visitorKey) {
        viewerReaction = row.reactionType;
      }
    }

    return {
      reactions,
      viewerReaction,
      comments: comments.map((comment) => this.toComment(comment)),
      commentsCount: comments.length,
    };
  }

  async upsertReaction(
    slug: string,
    dto: UpsertBlogReactionDto,
  ): Promise<PublicBlogEngagement> {
    const post = await this.findPublishedBySlug(slug);
    const visitorKey = dto.visitorKey.trim();
    const reactionType = dto.reactionType as EntityReactionType;

    const existing = await this.reactionsRepository.findOne({
      where: { blogPostId: post.id, visitorKey },
    });

    if (existing) {
      if (existing.reactionType === reactionType) {
        await this.reactionsRepository.remove(existing);
      } else {
        existing.reactionType = reactionType;
        await this.reactionsRepository.save(existing);
      }
    } else {
      await this.reactionsRepository.save(
        this.reactionsRepository.create({
          id: newId(),
          blogPostId: post.id,
          visitorKey,
          reactionType,
        }),
      );
    }

    return this.getEngagement(slug, visitorKey);
  }

  async createComment(
    slug: string,
    dto: CreateBlogCommentDto,
  ): Promise<PublicBlogComment> {
    const post = await this.findPublishedBySlug(slug);
    const authorName = dto.authorName.trim();
    const body = dto.body.trim();
    if (!authorName || !body) {
      throw new BadRequestException('Le nom et le commentaire sont obligatoires.');
    }

    const saved = await this.commentsRepository.save(
      this.commentsRepository.create({
        id: newId(),
        blogPostId: post.id,
        authorName,
        authorEmail: dto.authorEmail?.trim() || null,
        body,
        status: 'approved',
        visitorKey: dto.visitorKey?.trim() || null,
      }),
    );

    return this.toComment(saved);
  }

  private async findPublishedBySlug(
    slug: string,
    locale?: string,
  ): Promise<BlogPosts> {
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
    return post;
  }

  private toComment(comment: BlogComments): PublicBlogComment {
    return {
      id: comment.id,
      authorName: comment.authorName,
      body: comment.body,
      createdAt:
        comment.createdAt instanceof Date
          ? comment.createdAt.toISOString()
          : new Date(comment.createdAt as unknown as string).toISOString(),
    };
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
