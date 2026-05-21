import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Itineraries, ItineraryPorts } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateItineraryPortDto } from './dto/create-itinerary-port.dto';
import { ItineraryPortsListQueryDto } from './dto/itinerary-ports-list-query.dto';
import { UpdateItineraryPortDto } from './dto/update-itinerary-port.dto';

@Injectable()
export class ItineraryPortsService extends CrudService<ItineraryPorts> {
  constructor(
    @InjectRepository(ItineraryPorts)
    private readonly itineraryPortsRepository: Repository<ItineraryPorts>,
    @InjectRepository(Itineraries)
    private readonly itinerariesRepository: Repository<Itineraries>,
  ) {
    super(itineraryPortsRepository);
  }

  override async findAll(
    query: ItineraryPortsListQueryDto,
  ): Promise<PaginatedResult<ItineraryPorts>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.itineraryPortsRepository
      .createQueryBuilder('ip')
      .where('ip.deletedAt IS NULL');

    if (query.itineraryId) {
      qb.andWhere('ip.itineraryId = :itineraryId', {
        itineraryId: query.itineraryId,
      });
    }

    qb.orderBy('ip.dayNumber', 'ASC')
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

  async createItineraryPort(
    dto: CreateItineraryPortDto,
    actorUserId?: string,
  ): Promise<ItineraryPorts> {
    await this.assertItineraryExists(dto.itineraryId);
    return super.create(
      {
        itineraryId: dto.itineraryId,
        portId: dto.portId,
        dayNumber: dto.dayNumber,
        arrivalTime: dto.arrivalTime ?? null,
        departureTime: dto.departureTime ?? null,
      } as DeepPartial<ItineraryPorts>,
      actorUserId,
    );
  }

  async updateItineraryPort(
    id: string,
    dto: UpdateItineraryPortDto,
    actorUserId?: string,
  ): Promise<ItineraryPorts> {
    return super.update(id, dto as DeepPartial<ItineraryPorts>, actorUserId);
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
