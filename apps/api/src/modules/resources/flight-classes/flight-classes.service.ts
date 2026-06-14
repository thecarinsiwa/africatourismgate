import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { FlightClasses } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { FlightClassesListQueryDto } from './dto/flight-classes-list-query.dto';

@Injectable()
export class FlightClassesService extends CrudService<FlightClasses> {
  constructor(
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
  ) {
    super(flightClassesRepository);
  }

  override async findAll(
    query: FlightClassesListQueryDto,
  ): Promise<PaginatedResult<FlightClasses>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<FlightClasses> = {};
    if (query.flightId) {
      where.flightId = query.flightId;
    }
    const [data, total] = await this.flightClassesRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { className: 'ASC', createdAt: 'DESC' },
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
