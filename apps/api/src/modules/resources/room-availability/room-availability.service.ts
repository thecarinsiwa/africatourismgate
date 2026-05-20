import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { RoomAvailability, Rooms } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { BulkUpsertRoomAvailabilityDto } from './dto/bulk-upsert-room-availability.dto';
import { BulkUpsertRoomAvailabilityResponseDto } from './dto/bulk-upsert-room-availability-response.dto';
import { CreateRoomAvailabilityDto } from './dto/create-room-availability.dto';
import { RoomAvailabilityListQueryDto } from './dto/room-availability-list-query.dto';
import { UpdateRoomAvailabilityDto } from './dto/update-room-availability.dto';
import { enumerateDates } from './room-availability-date.util';

@Injectable()
export class RoomAvailabilityService extends CrudService<RoomAvailability> {
  constructor(
    @InjectRepository(RoomAvailability)
    private readonly availabilityRepository: Repository<RoomAvailability>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
  ) {
    super(availabilityRepository);
  }

  override async findAll(
    query: RoomAvailabilityListQueryDto,
  ): Promise<PaginatedResult<RoomAvailability>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.availabilityRepository
      .createQueryBuilder('ra')
      .where('ra.deletedAt IS NULL')
      .andWhere('ra.roomId = :roomId', { roomId: query.roomId });

    if (query.dateFrom) {
      qb.andWhere('ra.date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('ra.date <= :dateTo', { dateTo: query.dateTo });
    }

    qb.orderBy('ra.date', 'ASC')
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

  async createAvailability(
    dto: CreateRoomAvailabilityDto,
    actorUserId?: string,
  ): Promise<RoomAvailability> {
    await this.assertRoomExists(dto.roomId);

    const existing = await this.availabilityRepository.findOne({
      where: { roomId: dto.roomId, date: dto.date },
      withDeleted: true,
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'Une disponibilité existe déjà pour cette date.',
      );
    }

    if (existing?.deletedAt) {
      await this.availabilityRepository.recover(existing);
      const merged = this.availabilityRepository.merge(existing, {
        availableUnits: dto.availableUnits,
        priceCents: dto.priceCents,
        updatedByUserId: actorUserId ?? null,
      });
      return this.availabilityRepository.save(merged);
    }

    return super.create(
      {
        roomId: dto.roomId,
        date: dto.date,
        availableUnits: dto.availableUnits,
        priceCents: dto.priceCents,
      } as DeepPartial<RoomAvailability>,
      actorUserId,
    );
  }

  async updateAvailability(
    id: string,
    dto: UpdateRoomAvailabilityDto,
    actorUserId?: string,
  ): Promise<RoomAvailability> {
    return super.update(id, dto as DeepPartial<RoomAvailability>, actorUserId);
  }

  async bulkUpsert(
    dto: BulkUpsertRoomAvailabilityDto,
    actorUserId?: string,
  ): Promise<BulkUpsertRoomAvailabilityResponseDto> {
    await this.assertRoomExists(dto.roomId);
    const dates = enumerateDates(dto.dateFrom, dto.dateTo);

    const items = await this.availabilityRepository.manager.transaction(
      async (manager) => {
        const repo = manager.getRepository(RoomAvailability);
        const saved: RoomAvailability[] = [];

        for (const date of dates) {
          const row = await this.upsertOneDate(
            repo,
            dto.roomId,
            date,
            dto.availableUnits,
            dto.priceCents,
            actorUserId,
          );
          saved.push(row);
        }

        return saved;
      },
    );

    return {
      roomId: dto.roomId,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      upsertedCount: items.length,
      items,
    };
  }

  private async upsertOneDate(
    repo: Repository<RoomAvailability>,
    roomId: string,
    date: string,
    availableUnits: number,
    priceCents: number,
    actorUserId?: string,
  ): Promise<RoomAvailability> {
    const existing = await repo.findOne({
      where: { roomId, date },
      withDeleted: true,
    });

    if (existing) {
      if (existing.deletedAt) {
        await repo.recover(existing);
      }
      const merged = repo.merge(existing, {
        availableUnits,
        priceCents,
        updatedByUserId: actorUserId ?? null,
      });
      return repo.save(merged);
    }

    const entity = repo.create({
      id: newId(),
      roomId,
      date,
      availableUnits,
      priceCents,
      createdByUserId: actorUserId ?? null,
    });
    return repo.save(entity);
  }

  private async assertRoomExists(roomId: string): Promise<void> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
    });
    if (!room) {
      throw new NotFoundException('Chambre introuvable.');
    }
  }
}
