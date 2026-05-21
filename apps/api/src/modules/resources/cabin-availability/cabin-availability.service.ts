import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  CabinAvailability,
  Cabins,
  CruiseSailings,
} from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateCabinAvailabilityDto } from './dto/create-cabin-availability.dto';
import { CabinAvailabilityListQueryDto } from './dto/cabin-availability-list-query.dto';
import { UpdateCabinAvailabilityDto } from './dto/update-cabin-availability.dto';

@Injectable()
export class CabinAvailabilityService extends CrudService<CabinAvailability> {
  constructor(
    @InjectRepository(CabinAvailability)
    private readonly availabilityRepository: Repository<CabinAvailability>,
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    @InjectRepository(CruiseSailings)
    private readonly sailingsRepository: Repository<CruiseSailings>,
  ) {
    super(availabilityRepository);
  }

  override async findAll(
    query: CabinAvailabilityListQueryDto,
  ): Promise<PaginatedResult<CabinAvailability>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.availabilityRepository
      .createQueryBuilder('ca')
      .where('ca.deletedAt IS NULL')
      .andWhere('ca.sailingId = :sailingId', { sailingId: query.sailingId });

    if (query.cabinId) {
      qb.andWhere('ca.cabinId = :cabinId', { cabinId: query.cabinId });
    }

    qb.orderBy('ca.cabinId', 'ASC')
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
    dto: CreateCabinAvailabilityDto,
    actorUserId?: string,
  ): Promise<CabinAvailability> {
    await this.assertCabinExists(dto.cabinId);
    await this.assertSailingExists(dto.sailingId);

    const existing = await this.availabilityRepository.findOne({
      where: { cabinId: dto.cabinId, sailingId: dto.sailingId },
      withDeleted: true,
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        'Une disponibilité existe déjà pour cette cabine sur ce départ.',
      );
    }

    if (existing?.deletedAt) {
      await this.availabilityRepository.recover(existing);
      const merged = this.availabilityRepository.merge(existing, {
        availableCount: dto.availableCount,
        priceCents: dto.priceCents,
        updatedByUserId: actorUserId ?? null,
      });
      return this.availabilityRepository.save(merged);
    }

    return super.create(
      {
        cabinId: dto.cabinId,
        sailingId: dto.sailingId,
        availableCount: dto.availableCount,
        priceCents: dto.priceCents,
      } as DeepPartial<CabinAvailability>,
      actorUserId,
    );
  }

  async updateAvailability(
    id: string,
    dto: UpdateCabinAvailabilityDto,
    actorUserId?: string,
  ): Promise<CabinAvailability> {
    return super.update(id, dto as DeepPartial<CabinAvailability>, actorUserId);
  }

  private async assertCabinExists(cabinId: string): Promise<void> {
    const row = await this.cabinsRepository.findOne({ where: { id: cabinId } });
    if (!row) {
      throw new NotFoundException('Cabine introuvable.');
    }
  }

  private async assertSailingExists(sailingId: string): Promise<void> {
    const row = await this.sailingsRepository.findOne({ where: { id: sailingId } });
    if (!row) {
      throw new NotFoundException('Départ de croisière introuvable.');
    }
  }
}
