import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { ShipImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { ShipImagesListQueryDto } from './dto/ship-images-list-query.dto';

@Injectable()
export class ShipImagesService extends CrudService<ShipImages> {
  constructor(
    @InjectRepository(ShipImages)
    private readonly shipImagesRepository: Repository<ShipImages>,
  ) {
    super(shipImagesRepository);
  }

  override async findAll(
    query: ShipImagesListQueryDto,
  ): Promise<PaginatedResult<ShipImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<ShipImages> = {};
    if (query.shipId) {
      where.shipId = query.shipId;
    }
    const [data, total] = await this.shipImagesRepository.findAndCount({
      where,
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
