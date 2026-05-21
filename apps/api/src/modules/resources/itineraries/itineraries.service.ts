import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Itineraries, Ships } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItinerariesListQueryDto } from './dto/itineraries-list-query.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';

@Injectable()
export class ItinerariesService extends CrudService<Itineraries> {
  constructor(
    @InjectRepository(Itineraries)
    private readonly itinerariesRepository: Repository<Itineraries>,
    @InjectRepository(Ships)
    private readonly shipsRepository: Repository<Ships>,
  ) {
    super(itinerariesRepository);
  }

  override async findAll(
    query: ItinerariesListQueryDto,
  ): Promise<PaginatedResult<Itineraries>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.itinerariesRepository
      .createQueryBuilder('itinerary')
      .where('itinerary.deletedAt IS NULL');

    if (query.shipId) {
      qb.andWhere('itinerary.shipId = :shipId', { shipId: query.shipId });
    }

    qb.orderBy('itinerary.name', 'ASC')
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

  async createItinerary(
    dto: CreateItineraryDto,
    actorUserId?: string,
  ): Promise<Itineraries> {
    await this.assertShipExists(dto.shipId);
    return super.create(
      {
        shipId: dto.shipId,
        name: dto.name.trim(),
        durationNights: dto.durationNights,
      } as DeepPartial<Itineraries>,
      actorUserId,
    );
  }

  async updateItinerary(
    id: string,
    dto: UpdateItineraryDto,
    actorUserId?: string,
  ): Promise<Itineraries> {
    const payload = { ...dto } as UpdateItineraryDto;
    if (dto.name !== undefined) {
      payload.name = dto.name.trim();
    }
    return super.update(id, payload as DeepPartial<Itineraries>, actorUserId);
  }

  private async assertShipExists(shipId: string): Promise<void> {
    const ship = await this.shipsRepository.findOne({ where: { id: shipId } });
    if (!ship) {
      throw new NotFoundException('Navire introuvable.');
    }
  }
}
