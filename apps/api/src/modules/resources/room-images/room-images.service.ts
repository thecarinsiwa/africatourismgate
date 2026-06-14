import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { RoomImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { RoomImagesListQueryDto } from './dto/room-images-list-query.dto';

@Injectable()
export class RoomImagesService extends CrudService<RoomImages> {
  constructor(
    @InjectRepository(RoomImages)
    private readonly roomImagesRepository: Repository<RoomImages>,
  ) {
    super(roomImagesRepository);
  }

  override async findAll(
    query: RoomImagesListQueryDto,
  ): Promise<PaginatedResult<RoomImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<RoomImages> = {};
    if (query.roomId) {
      where.roomId = query.roomId;
    }
    const [data, total] = await this.roomImagesRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
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
