import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CruiseLines } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateCruiseLineDto } from './dto/create-cruise-line.dto';
import { CruiseLinesListQueryDto } from './dto/cruise-lines-list-query.dto';
import { UpdateCruiseLineDto } from './dto/update-cruise-line.dto';

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

    const qb = this.cruiseLinesRepository
      .createQueryBuilder('line')
      .where('line.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere('LOWER(line.name) LIKE :pattern', { pattern });
    }

    qb.orderBy('line.name', 'ASC')
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

  async createCruiseLine(
    dto: CreateCruiseLineDto,
    actorUserId?: string,
  ): Promise<CruiseLines> {
    return super.create(
      { name: dto.name.trim() } as DeepPartial<CruiseLines>,
      actorUserId,
    );
  }

  async updateCruiseLine(
    id: string,
    dto: UpdateCruiseLineDto,
    actorUserId?: string,
  ): Promise<CruiseLines> {
    const payload = { ...dto } as UpdateCruiseLineDto;
    if (dto.name !== undefined) {
      payload.name = dto.name.trim();
    }
    return super.update(id, payload as DeepPartial<CruiseLines>, actorUserId);
  }
}
