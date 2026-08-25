import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { BlogPosts } from '../../../entities/blog-post.entity';
import { BlogPostsListQueryDto } from './dto/blog-posts-list-query.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogPostsService extends CrudService<BlogPosts> {
  constructor(
    @InjectRepository(BlogPosts)
    private readonly blogPostsRepository: Repository<BlogPosts>,
  ) {
    super(blogPostsRepository);
  }

  createFromDto(dto: CreateBlogPostDto, actorUserId?: string): Promise<BlogPosts> {
    const payload = this.toEntityPayload(dto);
    if (!payload.translationKey && payload.slug) {
      payload.translationKey = payload.slug;
    }
    return super.create(payload, actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdateBlogPostDto,
    actorUserId?: string,
  ): Promise<BlogPosts> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreateBlogPostDto | UpdateBlogPostDto,
  ): DeepPartial<BlogPosts> {
    const payload: DeepPartial<BlogPosts> = { ...dto };

    const slug = dto.slug?.trim().toLowerCase();
    if (slug) {
      payload.slug = slug;
    }

    const translationKey = dto.translationKey?.trim().toLowerCase();
    if (translationKey) {
      payload.translationKey = translationKey;
    }

    if (dto.publishedAt !== undefined) {
      payload.publishedAt =
        dto.publishedAt === null || dto.publishedAt === ''
          ? null
          : new Date(dto.publishedAt);
    }

    if (dto.status === 'published' && !dto.publishedAt && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    return payload;
  }

  override async findAll(
    query: BlogPostsListQueryDto,
  ): Promise<PaginatedResult<BlogPosts>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(post.title LIKE :term OR post.slug LIKE :term OR post.excerpt LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('post.status = :status', { status: query.status });
    }

    if (query.locale) {
      qb.andWhere('post.locale = :locale', { locale: query.locale });
    }

    qb.orderBy('post.publishedAt', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
