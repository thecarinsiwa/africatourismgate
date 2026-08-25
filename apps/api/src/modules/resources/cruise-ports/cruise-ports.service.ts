import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { CruisePorts } from '../../../entities/generated';
import { CruisePortsListQueryDto } from './dto/cruise-ports-list-query.dto';

@Injectable()
export class CruisePortsService extends CrudService<CruisePorts> {
  constructor(
    @InjectRepository(CruisePorts)
    private readonly cruisePortsRepository: Repository<CruisePorts>,
  ) {
    super(cruisePortsRepository);
  }

  override async findAll(
    query: CruisePortsListQueryDto,
  ): Promise<PaginatedResult<CruisePorts>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.cruisePortsRepository
      .createQueryBuilder('port')
      .where('port.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(port.code LIKE :term OR port.name LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('port.createdAt', 'DESC')
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
