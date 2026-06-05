import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyAmenities } from '../../../entities/generated';
import { PaginationQueryDto, PaginatedResult } from '../../../common/dto/pagination-query.dto';

@Injectable()
export class PropertyAmenitiesService {
  constructor(
    @InjectRepository(PropertyAmenities)
    private readonly repository: Repository<PropertyAmenities>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<PropertyAmenities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.repository.findAndCount({
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
