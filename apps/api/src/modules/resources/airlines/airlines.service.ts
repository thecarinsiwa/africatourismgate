import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Airlines } from '../../../entities/generated';
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
    const search = query.search?.trim();

    const qb = this.airlinesRepository
      .createQueryBuilder('airline')
      .where('airline.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(airline.iataCode LIKE :term OR airline.name LIKE :term)', {
        term: `%${search}%`,
      });
    }

    if (query.hasLogo === true) {
      qb.andWhere("airline.logoUrl IS NOT NULL AND airline.logoUrl <> ''");
    } else if (query.hasLogo === false) {
      qb.andWhere("(airline.logoUrl IS NULL OR airline.logoUrl = '')");
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
