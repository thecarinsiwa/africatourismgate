import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Amenities, Properties, PropertyAmenities } from '../../../entities/generated';
import { PropertyAmenitiesListQueryDto } from './dto/property-amenities-list-query.dto';
import { PropertyAmenitiesPayloadDto } from './dto/property-amenities-payload.dto';
import { ReplacePropertyAmenitiesDto } from './dto/replace-property-amenities.dto';

@Injectable()
export class PropertyAmenitiesService {
  constructor(
    @InjectRepository(PropertyAmenities)
    private readonly repository: Repository<PropertyAmenities>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Amenities)
    private readonly amenitiesRepository: Repository<Amenities>,
  ) {}

  async findAll(
    query: PropertyAmenitiesListQueryDto,
  ): Promise<PaginatedResult<PropertyAmenities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repository
      .createQueryBuilder('pa')
      .where('pa.deletedAt IS NULL');

    if (query.propertyId) {
      qb.andWhere('pa.propertyId = :propertyId', {
        propertyId: query.propertyId,
      });
    }

    qb.orderBy('pa.createdAt', 'DESC')
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

  async create(dto: Partial<PropertyAmenities>): Promise<PropertyAmenities> {
    const row = this.repository.create(dto);
    return this.repository.save(row);
  }

  async remove(propertyId: string, amenityId: string): Promise<void> {
    const row = await this.repository.findOne({
      where: { propertyId, amenityId } as never,
    });
    if (!row) throw new NotFoundException('Resource not found');
    await this.repository.softRemove(row);
  }

  async replace(
    dto: ReplacePropertyAmenitiesDto,
    actorUserId?: string,
  ): Promise<PropertyAmenitiesPayloadDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException('Propriété introuvable.');
    }

    const uniqueIds = [...new Set(dto.amenityIds)];
    if (uniqueIds.length > 0) {
      const count = await this.amenitiesRepository
        .createQueryBuilder('a')
        .where('a.id IN (:...ids)', { ids: uniqueIds })
        .andWhere('a.deletedAt IS NULL')
        .getCount();
      if (count !== uniqueIds.length) {
        throw new NotFoundException('Un ou plusieurs équipements sont introuvables.');
      }
    }

    const existing = await this.repository.find({
      where: { propertyId: dto.propertyId },
      withDeleted: true,
    });

    const targetSet = new Set(uniqueIds);

    for (const row of existing) {
      const shouldHave = targetSet.has(row.amenityId);
      if (shouldHave && row.deletedAt) {
        await this.repository.recover(row);
        if (actorUserId) {
          await this.repository.update(
            { propertyId: row.propertyId, amenityId: row.amenityId } as never,
            { updatedByUserId: actorUserId } as never,
          );
        }
      } else if (!shouldHave && !row.deletedAt) {
        await this.repository.softRemove(row);
        if (actorUserId) {
          await this.repository.update(
            { propertyId: row.propertyId, amenityId: row.amenityId } as never,
            { deletedByUserId: actorUserId } as never,
          );
        }
      }
    }

    const activeIds = new Set(
      existing.filter((r) => !r.deletedAt).map((r) => r.amenityId),
    );

    for (const amenityId of uniqueIds) {
      if (!activeIds.has(amenityId)) {
        const prior = existing.find((r) => r.amenityId === amenityId);
        if (prior?.deletedAt) {
          await this.repository.recover(prior);
        } else if (!prior) {
          await this.repository.save(
            this.repository.create({
              propertyId: dto.propertyId,
              amenityId,
              createdByUserId: actorUserId ?? null,
            }),
          );
        }
      }
    }

    const active = await this.repository.find({
      where: { propertyId: dto.propertyId },
    });

    return {
      propertyId: dto.propertyId,
      amenityIds: active.filter((r) => !r.deletedAt).map((r) => r.amenityId),
    };
  }
}
