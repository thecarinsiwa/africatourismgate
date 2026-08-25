import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { CruiseLines } from '../../../entities/generated';
import { CruiseLinesListQueryDto } from './dto/cruise-lines-list-query.dto';

@Injectable()
export class CruiseLinesService extends CrudService<CruiseLines> {
  constructor(
    @InjectRepository(CruiseLines)
    private readonly cruiseLinesRepository: Repository<CruiseLines>,
  ) {
    super(cruiseLinesRepository);
  }

  override async findAll(
    query: CruiseLinesListQueryDto,
  ): Promise<PaginatedResult<CruiseLines>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const [data, total] = await this.cruiseLinesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(search ? { name: Like(`%${search}%`) } : {}),
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
