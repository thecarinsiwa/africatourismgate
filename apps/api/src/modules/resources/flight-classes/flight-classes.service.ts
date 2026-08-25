import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { FlightClasses } from '../../../entities/generated';
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

    const [data, total] = await this.flightClassesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.flightId ? { flightId: query.flightId } : {}),
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
