import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Properties } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertiesListQueryDto } from './dto/properties-list-query.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService extends CrudService<Properties> {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
  ) {
    super(propertiesRepository);
  }

  override async findAll(
    query: PropertiesListQueryDto,
  ): Promise<PaginatedResult<Properties>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.propertiesRepository
      .createQueryBuilder('prop')
      .where('prop.deletedAt IS NULL');

    if (query.destinationId) {
      qb.andWhere('prop.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(prop.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(prop.slug) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('prop.createdAt', 'DESC')
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

  createProperty(dto: CreatePropertyDto, actorUserId?: string): Promise<Properties> {
    const slug = dto.slug.trim().toLowerCase();
    return this.assertSlugAvailable(slug).then(() =>
      super.create(this.toEntityPayload(dto, slug), actorUserId),
    );
  }

  updateProperty(
    id: string,
    dto: UpdatePropertyDto,
    actorUserId?: string,
  ): Promise<Properties> {
    const slug =
      dto.slug !== undefined ? dto.slug.trim().toLowerCase() : undefined;
    const checkSlug = slug
      ? this.assertSlugAvailable(slug, id).then(() => slug)
      : Promise.resolve(undefined);
    return checkSlug.then((normalizedSlug) =>
      super.update(
        id,
        this.toEntityPayload(dto, normalizedSlug),
        actorUserId,
      ),
    );
  }

  private toEntityPayload(
    dto: CreatePropertyDto | UpdatePropertyDto,
    slug?: string,
  ): DeepPartial<Properties> {
    const { starRating, ...rest } = dto;
    const payload: DeepPartial<Properties> = { ...rest };
    if (slug !== undefined) payload.slug = slug;
    if (starRating !== undefined) {
      payload.starRating = String(starRating);
    }
    return payload;
  }

  private async assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.propertiesRepository.findOne({
      where: { slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'Ce slug est déjà utilisé par une autre propriété.',
      );
    }
  }
}
