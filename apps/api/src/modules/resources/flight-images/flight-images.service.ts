import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { FlightImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { FlightImagesListQueryDto } from './dto/flight-images-list-query.dto';

@Injectable()
export class FlightImagesService extends CrudService<FlightImages> {
  constructor(
    @InjectRepository(FlightImages)
    private readonly flightImagesRepository: Repository<FlightImages>,
  ) {
    super(flightImagesRepository);
  }

  override async findAll(
    query: FlightImagesListQueryDto,
  ): Promise<PaginatedResult<FlightImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<FlightImages> = {};
    if (query.flightId) {
      where.flightId = query.flightId;
    }
    const [data, total] = await this.flightImagesRepository.findAndCount({
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
