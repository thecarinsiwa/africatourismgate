import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Vehicles } from '../../../entities/generated';
import { VehiclesListQueryDto } from './dto/vehicles-list-query.dto';

@Injectable()
export class VehiclesService extends CrudService<Vehicles> {
  constructor(
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
  ) {
    super(vehiclesRepository);
  }

  override async findAll(
    query: VehiclesListQueryDto,
  ): Promise<PaginatedResult<Vehicles>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const [data, total] = await this.vehiclesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.agencyId ? { agencyId: query.agencyId } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(search ? { licensePlate: Like(`%${search}%`) } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

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
