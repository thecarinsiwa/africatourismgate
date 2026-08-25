import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { VehicleCategories } from '../../../entities/generated';
import { VehicleCategoriesListQueryDto } from './dto/vehicle-categories-list-query.dto';

@Injectable()
export class VehicleCategoriesService extends CrudService<VehicleCategories> {
  constructor(
    @InjectRepository(VehicleCategories)
    private readonly vehicleCategoriesRepository: Repository<VehicleCategories>,
  ) {
    super(vehicleCategoriesRepository);
  }

  override async findAll(
    query: VehicleCategoriesListQueryDto,
  ): Promise<PaginatedResult<VehicleCategories>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.vehicleCategoriesRepository
      .createQueryBuilder('category')
      .where('category.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(category.name LIKE :term OR category.exampleModel LIKE :term)',
        { term: `%${search}%` },
      );
    }

    if (query.hasExampleModel === true) {
      qb.andWhere(
        "category.exampleModel IS NOT NULL AND category.exampleModel <> ''",
      );
    } else if (query.hasExampleModel === false) {
      qb.andWhere(
        "(category.exampleModel IS NULL OR category.exampleModel = '')",
      );
    }

    qb.orderBy('category.createdAt', 'DESC')
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
