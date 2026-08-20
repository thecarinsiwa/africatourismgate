import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PropertyAmenities } from '../../../entities/generated';
import { PropertyAmenitiesListQueryDto } from './dto/property-amenities-list-query.dto';

@Injectable()
export class PropertyAmenitiesService {
  constructor(
    @InjectRepository(PropertyAmenities)
    private readonly repository: Repository<PropertyAmenities>,
  ) {}

  async findAll(
    query: PropertyAmenitiesListQueryDto,
  ): Promise<PaginatedResult<PropertyAmenities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.repository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.propertyId ? { propertyId: query.propertyId } : {}),
      },
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

  async remove(propertyId: string, amenityId: string): Promise<void> {
    const row = await this.repository.findOne({
      where: { propertyId, amenityId } as never,
    });
    if (!row) throw new NotFoundException('Resource not found');
    await this.repository.softRemove(row);
  }
}
