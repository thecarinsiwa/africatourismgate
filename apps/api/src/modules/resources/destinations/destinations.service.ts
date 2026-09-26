import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import {
  Activities,
  ActivityProviders,
  Destinations,
  PackageItems,
  Packages,
  Properties,
} from '../../../entities/generated';
import { DestinationRelatedCountsDto } from './dto/destination-related-counts.dto';
import { DestinationsListQueryDto } from './dto/destinations-list-query.dto';

const DESTINATION_SLUG_SOFT_DELETED = 'DESTINATION_SLUG_SOFT_DELETED';
const DESTINATION_SLUG_TAKEN = 'DESTINATION_SLUG_TAKEN';

@Injectable()
export class DestinationsService extends CrudService<Destinations> {
  constructor(
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,
  ) {
    super(destinationsRepository);
  }

  override async findAll(
    query: DestinationsListQueryDto,
  ): Promise<PaginatedResult<Destinations>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.destinationsRepository
      .createQueryBuilder('destination')
      .where('destination.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(destination.name LIKE :term OR destination.slug LIKE :term OR destination.countryCode LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.isFeatured !== undefined) {
      qb.andWhere('destination.isFeatured = :isFeatured', {
        isFeatured: query.isFeatured ? 1 : 0,
      });
    }

    qb.orderBy('destination.createdAt', 'DESC')
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

  override async create(
    dto: DeepPartial<Destinations>,
    actorUserId?: string,
  ): Promise<Destinations> {
    try {
      return await super.create(dto, actorUserId);
    } catch (error) {
      await this.rethrowSlugConflict(error, dto.slug);
      throw error;
    }
  }

  override async update(
    id: string,
    dto: DeepPartial<Destinations>,
    actorUserId?: string,
  ): Promise<Destinations> {
    try {
      return await super.update(id, dto, actorUserId);
    } catch (error) {
      await this.rethrowSlugConflict(error, dto.slug, id);
      throw error;
    }
  }

  async restore(id: string, actorUserId?: string): Promise<Destinations> {
    const existing = await this.destinationsRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!existing) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    if (!existing.deletedAt) {
      throw new BadRequestException("Cette destination n'est pas soft-supprimée.");
    }

    await this.destinationsRepository.recover(existing);
    const restored = this.destinationsRepository.merge(existing, {
      deletedByUserId: null,
      updatedByUserId: actorUserId ?? null,
    });
    return this.destinationsRepository.save(restored);
  }

  async getRelatedCounts(id: string): Promise<DestinationRelatedCountsDto> {
    await this.findOne(id);

    const [properties, activities, packagesRow] = await Promise.all([
      this.propertiesRepository.count({ where: { destinationId: id } }),
      this.activitiesRepository
        .createQueryBuilder('activity')
        .innerJoin(
          ActivityProviders,
          'provider',
          'provider.id = activity.providerId AND provider.deletedAt IS NULL',
        )
        .where('provider.destinationId = :id', { id })
        .andWhere('activity.deletedAt IS NULL')
        .getCount(),
      this.packagesRepository
        .createQueryBuilder('pkg')
        .innerJoin(
          PackageItems,
          'item',
          'item.packageId = pkg.id AND item.deletedAt IS NULL',
        )
        .leftJoin(
          Properties,
          'property',
          "item.itemType = 'property' AND property.id = item.itemId AND property.deletedAt IS NULL",
        )
        .leftJoin(
          Activities,
          'activity',
          "item.itemType = 'activity' AND activity.id = item.itemId AND activity.deletedAt IS NULL",
        )
        .leftJoin(
          ActivityProviders,
          'provider',
          'activity.providerId = provider.id AND provider.deletedAt IS NULL',
        )
        .where('pkg.deletedAt IS NULL')
        .andWhere('(property.destinationId = :id OR provider.destinationId = :id)', {
          id,
        })
        .select('COUNT(DISTINCT pkg.id)', 'count')
        .getRawOne<{ count: string }>(),
    ]);

    return {
      properties,
      activities,
      packages: Number(packagesRow?.count ?? 0),
    };
  }

  private async rethrowSlugConflict(
    error: unknown,
    slug: unknown,
    excludeId?: string,
  ): Promise<void> {
    if (!this.isDuplicateEntryError(error)) {
      return;
    }

    const normalizedSlug = typeof slug === 'string' ? slug.trim() : '';
    if (!normalizedSlug) {
      throw new ConflictException({
        code: DESTINATION_SLUG_TAKEN,
        message: 'Ce slug est déjà utilisé.',
      });
    }

    const existing = await this.destinationsRepository.findOne({
      where: { slug: normalizedSlug },
      withDeleted: true,
    });

    if (existing && existing.id !== excludeId && existing.deletedAt) {
      throw new ConflictException({
        code: DESTINATION_SLUG_SOFT_DELETED,
        message:
          'Une destination avec ce slug a été supprimée. Vous pouvez la restaurer.',
        deletedDestination: {
          id: existing.id,
          name: existing.name,
          slug: existing.slug,
        },
      });
    }

    throw new ConflictException({
      code: DESTINATION_SLUG_TAKEN,
      message: 'Ce slug est déjà utilisé.',
    });
  }

  private isDuplicateEntryError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
    );
  }
}
