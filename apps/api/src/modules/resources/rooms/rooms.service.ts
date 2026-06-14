import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Rooms } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { RoomsListQueryDto } from './dto/rooms-list-query.dto';

@Injectable()
export class RoomsService extends CrudService<Rooms> {
  constructor(
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
  ) {
    super(roomsRepository);
  }

  override async findAll(query: RoomsListQueryDto): Promise<PaginatedResult<Rooms>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<Rooms> = {};
    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }
    const [data, total] = await this.roomsRepository.findAndCount({
      where,
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
