import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Ships } from '../../../entities/generated';
import { ShipsListQueryDto } from './dto/ships-list-query.dto';

@Injectable()
export class ShipsService extends CrudService<Ships> {
  constructor(
    @InjectRepository(Ships)
    private readonly shipsRepository: Repository<Ships>,
  ) {
    super(shipsRepository);
  }

  override async findAll(
    query: ShipsListQueryDto,
  ): Promise<PaginatedResult<Ships>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const [data, total] = await this.shipsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.cruiseLineId ? { cruiseLineId: query.cruiseLineId } : {}),
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
