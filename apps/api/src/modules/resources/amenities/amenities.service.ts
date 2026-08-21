import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Amenities } from '../../../entities/generated';
import { AmenitiesListQueryDto } from './dto/amenities-list-query.dto';

@Injectable()
export class AmenitiesService extends CrudService<Amenities> {
  constructor(
    @InjectRepository(Amenities)
    private readonly amenitiesRepository: Repository<Amenities>,
  ) {
    super(amenitiesRepository);
  }

  override async findAll(
    query: AmenitiesListQueryDto,
  ): Promise<PaginatedResult<Amenities>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.amenitiesRepository
      .createQueryBuilder('amenity')
      .where('amenity.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(amenity.code LIKE :term OR amenity.name LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('amenity.createdAt', 'DESC')
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
