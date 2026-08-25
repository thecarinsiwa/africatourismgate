import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { VehicleImages } from '../../../entities/generated';
import { VehicleImagesListQueryDto } from './dto/vehicle-images-list-query.dto';

@Injectable()
export class VehicleImagesService extends CrudService<VehicleImages> {
  constructor(
    @InjectRepository(VehicleImages)
    private readonly vehicleImagesRepository: Repository<VehicleImages>,
  ) {
    super(vehicleImagesRepository);
  }

  override async findAll(
    query: VehicleImagesListQueryDto,
  ): Promise<PaginatedResult<VehicleImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.vehicleImagesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
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
