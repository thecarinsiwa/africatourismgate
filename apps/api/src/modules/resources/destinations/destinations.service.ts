import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
