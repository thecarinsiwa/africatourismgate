import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { VehicleCategories } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateVehicleCategoryDto } from './dto/create-vehicle-category.dto';
import { VehicleCategoriesListQueryDto } from './dto/vehicle-categories-list-query.dto';
import { UpdateVehicleCategoryDto } from './dto/update-vehicle-category.dto';

@Injectable()
export class VehicleCategoriesService extends CrudService<VehicleCategories> {
  constructor(
    @InjectRepository(VehicleCategories)
    private readonly categoriesRepository: Repository<VehicleCategories>,
  ) {
    super(categoriesRepository);
  }

  override async findAll(
    query: VehicleCategoriesListQueryDto,
  ): Promise<PaginatedResult<VehicleCategories>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.categoriesRepository
      .createQueryBuilder('cat')
      .where('cat.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(cat.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(cat.exampleModel) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('cat.name', 'ASC')
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

  async createCategory(
    dto: CreateVehicleCategoryDto,
    actorUserId?: string,
  ): Promise<VehicleCategories> {
    return super.create(
      {
        name: dto.name.trim(),
        ...(dto.exampleModel?.trim()
          ? { exampleModel: dto.exampleModel.trim() }
          : {}),
      } as DeepPartial<VehicleCategories>,
      actorUserId,
    );
  }

  async updateCategory(
    id: string,
    dto: UpdateVehicleCategoryDto,
    actorUserId?: string,
  ): Promise<VehicleCategories> {
    const payload: DeepPartial<VehicleCategories> = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.exampleModel !== undefined) {
      (payload as { exampleModel?: string | null }).exampleModel =
        dto.exampleModel?.trim() || null;
    }
    return super.update(id, payload, actorUserId);
  }
}
