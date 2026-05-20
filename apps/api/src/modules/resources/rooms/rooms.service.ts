import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Rooms } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsListQueryDto } from './dto/rooms-list-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService extends CrudService<Rooms> {
  constructor(
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
  ) {
    super(roomsRepository);
  }

  override async findAll(
    query: RoomsListQueryDto,
  ): Promise<PaginatedResult<Rooms>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.roomsRepository
      .createQueryBuilder('room')
      .where('room.deletedAt IS NULL');

    if (query.propertyId) {
      qb.andWhere('room.propertyId = :propertyId', {
        propertyId: query.propertyId,
      });
    }

    qb.orderBy('room.createdAt', 'DESC')
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

  createRoom(dto: CreateRoomDto, actorUserId?: string): Promise<Rooms> {
    return super.create(
      {
        ...dto,
        currency: dto.currency.trim().toUpperCase(),
      } as DeepPartial<Rooms>,
      actorUserId,
    );
  }

  updateRoom(
    id: string,
    dto: UpdateRoomDto,
    actorUserId?: string,
  ): Promise<Rooms> {
    const payload = { ...dto } as UpdateRoomDto;
    if (dto.currency !== undefined) {
      payload.currency = dto.currency.trim().toUpperCase();
    }
    return super.update(id, payload as DeepPartial<Rooms>, actorUserId);
  }
}
