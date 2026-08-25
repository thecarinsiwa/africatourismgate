import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
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

  async replace(dto: ReplacePropertyAmenitiesDto): Promise<PropertyAmenitiesPayloadDto> {
    const property = await this.propertiesRepository.findOne({
      where: { id: dto.propertyId, deletedAt: IsNull() },
    });
    if (!property) {
      throw new NotFoundException('Hébergement introuvable.');
    }

    const amenityIds = [...new Set(dto.amenityIds)];
    if (amenityIds.length > 0) {
      const amenities = await this.amenitiesRepository.find({
        where: { id: In(amenityIds), deletedAt: IsNull() },
      });
      if (amenities.length !== amenityIds.length) {
        throw new BadRequestException(
          'Un ou plusieurs équipements sont introuvables.',
        );
      }
    }

    const existing = await this.repository.find({
      where: { propertyId: dto.propertyId },
      withDeleted: true,
    });

    const desired = new Set(amenityIds);

    for (const row of existing) {
      if (!desired.has(row.amenityId)) {
        if (!row.deletedAt) {
          await this.repository.softRemove(row);
        }
        continue;
      }

      if (row.deletedAt) {
        await this.repository.recover(row);
      }
      desired.delete(row.amenityId);
    }

    for (const amenityId of desired) {
      await this.repository.save(
        this.repository.create({
          propertyId: dto.propertyId,
          amenityId,
        }),
      );
    }

    return {
      propertyId: dto.propertyId,
      amenityIds,
    };
  }

  async remove(propertyId: string, amenityId: string): Promise<void> {
    const row = await this.repository.findOne({
      where: { propertyId, amenityId } as never,
    });
    if (!row) throw new NotFoundException('Resource not found');
    await this.repository.softRemove(row);
  }
}
