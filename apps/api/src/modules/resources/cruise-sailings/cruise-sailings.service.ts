import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CruiseSailings, Itineraries } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateCruiseSailingDto } from './dto/create-cruise-sailing.dto';
import { CruiseSailingsListQueryDto } from './dto/cruise-sailings-list-query.dto';
import { UpdateCruiseSailingDto } from './dto/update-cruise-sailing.dto';

@Injectable()
export class CruiseSailingsService extends CrudService<CruiseSailings> {
  constructor(
    @InjectRepository(CruiseSailings)
    private readonly sailingsRepository: Repository<CruiseSailings>,
    @InjectRepository(Itineraries)
    private readonly itinerariesRepository: Repository<Itineraries>,
  ) {
    super(sailingsRepository);
  }

  override async findAll(
    query: CruiseSailingsListQueryDto,
  ): Promise<PaginatedResult<CruiseSailings>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.sailingsRepository
      .createQueryBuilder('sailing')
      .where('sailing.deletedAt IS NULL');

    if (query.itineraryId) {
      qb.andWhere('sailing.itineraryId = :itineraryId', {
        itineraryId: query.itineraryId,
      });
    }

    qb.orderBy('sailing.departureDate', 'DESC')
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

  async createCruiseSailing(
    dto: CreateCruiseSailingDto,
    actorUserId?: string,
  ): Promise<CruiseSailings> {
    await this.assertItineraryExists(dto.itineraryId);
    return super.create(
      {
        itineraryId: dto.itineraryId,
        departureDate: dto.departureDate,
      } as DeepPartial<CruiseSailings>,
      actorUserId,
    );
  }

  async updateCruiseSailing(
    id: string,
    dto: UpdateCruiseSailingDto,
    actorUserId?: string,
  ): Promise<CruiseSailings> {
    if (dto.itineraryId) {
      await this.assertItineraryExists(dto.itineraryId);
    }
    return super.update(id, dto as DeepPartial<CruiseSailings>, actorUserId);
  }

  private async assertItineraryExists(itineraryId: string): Promise<void> {
    const row = await this.itinerariesRepository.findOne({
      where: { id: itineraryId },
    });
    if (!row) {
      throw new NotFoundException('Itinéraire introuvable.');
    }
  }
}
