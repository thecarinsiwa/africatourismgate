import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { FlightClassAvailability, FlightClasses } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { BulkUpsertFlightClassAvailabilityDto } from './dto/bulk-upsert-flight-class-availability.dto';
import { BulkUpsertFlightClassAvailabilityResponseDto } from './dto/bulk-upsert-flight-class-availability-response.dto';
import { CreateFlightClassAvailabilityDto } from './dto/create-flight-class-availability.dto';
import { FlightClassAvailabilityListQueryDto } from './dto/flight-class-availability-list-query.dto';
import { UpdateFlightClassAvailabilityDto } from './dto/update-flight-class-availability.dto';
import { enumerateDates } from '../room-availability/room-availability-date.util';

@Injectable()
export class FlightClassAvailabilityService extends CrudService<FlightClassAvailability> {
  constructor(
    @InjectRepository(FlightClassAvailability)
    private readonly availabilityRepository: Repository<FlightClassAvailability>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
  ) {
    super(availabilityRepository);
  }

  override async findAll(
    query: FlightClassAvailabilityListQueryDto,
  ): Promise<PaginatedResult<FlightClassAvailability>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.availabilityRepository
      .createQueryBuilder('fca')
      .where('fca.deletedAt IS NULL')
      .andWhere('fca.flightClassId = :flightClassId', {
        flightClassId: query.flightClassId,
      });

    if (query.dateFrom) {
      qb.andWhere('fca.date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('fca.date <= :dateTo', { dateTo: query.dateTo });
    }

    qb.orderBy('fca.date', 'ASC')
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
    dto: CreateFlightClassAvailabilityDto,
    actorUserId?: string,
  ): Promise<FlightClassAvailability> {
    await this.assertFlightClassExists(dto.flightClassId);

    const existing = await this.availabilityRepository.findOne({
      where: { flightClassId: dto.flightClassId, date: dto.date },
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
        availableSeats: dto.availableSeats,
        priceCents: dto.priceCents,
        updatedByUserId: actorUserId ?? null,
      });
      return this.availabilityRepository.save(merged);
    }

    return super.create(
      {
        flightClassId: dto.flightClassId,
        date: dto.date,
        availableSeats: dto.availableSeats,
        priceCents: dto.priceCents,
      } as DeepPartial<FlightClassAvailability>,
      actorUserId,
    );
  }

  async updateAvailability(
    id: string,
    dto: UpdateFlightClassAvailabilityDto,
    actorUserId?: string,
  ): Promise<FlightClassAvailability> {
    return super.update(id, dto as DeepPartial<FlightClassAvailability>, actorUserId);
  }

  async bulkUpsert(
    dto: BulkUpsertFlightClassAvailabilityDto,
    actorUserId?: string,
  ): Promise<BulkUpsertFlightClassAvailabilityResponseDto> {
    await this.assertFlightClassExists(dto.flightClassId);
    const dates = enumerateDates(dto.dateFrom, dto.dateTo);

    const items = await this.availabilityRepository.manager.transaction(
      async (manager) => {
        const repo = manager.getRepository(FlightClassAvailability);
        const saved: FlightClassAvailability[] = [];

        for (const date of dates) {
          const row = await this.upsertOneDate(
            repo,
            dto.flightClassId,
            date,
            dto.availableSeats,
            dto.priceCents,
            actorUserId,
          );
          saved.push(row);
        }

        return saved;
      },
    );

    return {
      flightClassId: dto.flightClassId,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      upsertedCount: items.length,
      items,
    };
  }

  private async upsertOneDate(
    repo: Repository<FlightClassAvailability>,
    flightClassId: string,
    date: string,
    availableSeats: number,
    priceCents: number,
    actorUserId?: string,
  ): Promise<FlightClassAvailability> {
    const existing = await repo.findOne({
      where: { flightClassId, date },
      withDeleted: true,
    });

    if (existing) {
      if (existing.deletedAt) {
        await repo.recover(existing);
      }
      const merged = repo.merge(existing, {
        availableSeats,
        priceCents,
        updatedByUserId: actorUserId ?? null,
      });
      return repo.save(merged);
    }

    const entity = repo.create({
      id: newId(),
      flightClassId,
      date,
      availableSeats,
      priceCents,
      createdByUserId: actorUserId ?? null,
    });
    return repo.save(entity);
  }

  private async assertFlightClassExists(flightClassId: string): Promise<void> {
    const row = await this.flightClassesRepository.findOne({
      where: { id: flightClassId },
    });
    if (!row) {
      throw new NotFoundException('Classe de vol introuvable.');
    }
  }
}
