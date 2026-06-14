import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Properties, PropertyAmenities } from '../../../entities/generated';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PropertyAmenitiesListQueryDto } from './dto/property-amenities-list-query.dto';

export type PropertyAmenitiesSyncResult = {
  propertyId: string;
  amenityIds: string[];
};

@Injectable()
export class PropertyAmenitiesService {
  constructor(
    @InjectRepository(PropertyAmenities)
    private readonly repository: Repository<PropertyAmenities>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
  ) {}

  async findAll(
    query: PropertyAmenitiesListQueryDto,
  ): Promise<PaginatedResult<PropertyAmenities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<PropertyAmenities> = {};
    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }
    const [data, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async create(dto: Partial<PropertyAmenities>): Promise<PropertyAmenities> {
    const row = this.repository.create(dto);
    return this.repository.save(row);
  }

  async replace(
    propertyId: string,
    amenityIds: string[],
  ): Promise<PropertyAmenitiesSyncResult> {
    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException('Hébergement introuvable.');
    }

    const uniqueIds = [...new Set(amenityIds)];

    await this.repository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(PropertyAmenities);
      const existing = await repo.find({
        where: { propertyId },
        withDeleted: true,
      });
      const pending = new Set(uniqueIds);

      for (const row of existing) {
        if (pending.has(row.amenityId)) {
          if (row.deletedAt) {
            await repo.recover(row);
          }
          pending.delete(row.amenityId);
        } else if (!row.deletedAt) {
          await repo.softRemove(row);
        }
      }

      for (const amenityId of pending) {
        const entity = repo.create({ propertyId, amenityId });
        await repo.save(entity);
      }
    });

    return { propertyId, amenityIds: uniqueIds };
  }

  async remove(propertyId: string, amenityId: string): Promise<void> {
    const row = await this.repository.findOne({
      where: { propertyId, amenityId } as never,
    });
    if (!row) throw new NotFoundException('Resource not found');
    await this.repository.softRemove(row);
  }
}
