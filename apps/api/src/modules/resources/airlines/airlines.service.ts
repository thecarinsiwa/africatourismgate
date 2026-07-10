import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Airlines } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { AirlinesListQueryDto } from './dto/airlines-list-query.dto';

@Injectable()
export class AirlinesService extends CrudService<Airlines> {
  constructor(
    @InjectRepository(Airlines)
    private readonly airlinesRepository: Repository<Airlines>,
  ) {
    super(airlinesRepository);
  }

  override async findAll(
    query: AirlinesListQueryDto,
  ): Promise<PaginatedResult<Airlines>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.airlinesRepository
      .createQueryBuilder('airline')
      .where('airline.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(airline.iataCode LIKE :term OR airline.name LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('airline.createdAt', 'DESC')
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
