import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Rooms } from '../../../entities/generated';
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

    const [data, total] = await this.roomsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.propertyId ? { propertyId: query.propertyId } : {}),
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
