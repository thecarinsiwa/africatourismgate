import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Airlines, Airports, Flights } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FlightsListQueryDto } from './dto/flights-list-query.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';

@Injectable()
export class FlightsService extends CrudService<Flights> {
  constructor(
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
    @InjectRepository(Airlines)
    private readonly airlinesRepository: Repository<Airlines>,
    @InjectRepository(Airports)
    private readonly airportsRepository: Repository<Airports>,
  ) {
    super(flightsRepository);
  }

  override async findAll(
    query: FlightsListQueryDto,
  ): Promise<PaginatedResult<Flights>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.flightsRepository
      .createQueryBuilder('flight')
      .where('flight.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toUpperCase()}%`;
      qb.andWhere('UPPER(flight.flightNumber) LIKE :pattern', { pattern });
    }

    qb.orderBy('flight.createdAt', 'DESC')
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

  async createFlight(dto: CreateFlightDto, actorUserId?: string): Promise<Flights> {
    await this.assertAirlineExists(dto.airlineId);
    await this.assertAirportExists(dto.departureAirportId);
    await this.assertAirportExists(dto.arrivalAirportId);

    return super.create(
      {
        airlineId: dto.airlineId,
        flightNumber: dto.flightNumber.trim().toUpperCase(),
        departureAirportId: dto.departureAirportId,
        arrivalAirportId: dto.arrivalAirportId,
        departureTime: new Date(dto.departureTime),
        arrivalTime: new Date(dto.arrivalTime),
        durationMinutes: dto.durationMinutes,
      } as DeepPartial<Flights>,
      actorUserId,
    );
  }

  async updateFlight(
    id: string,
    dto: UpdateFlightDto,
    actorUserId?: string,
  ): Promise<Flights> {
    if (dto.airlineId) await this.assertAirlineExists(dto.airlineId);
    if (dto.departureAirportId) await this.assertAirportExists(dto.departureAirportId);
    if (dto.arrivalAirportId) await this.assertAirportExists(dto.arrivalAirportId);

    const payload: DeepPartial<Flights> = { ...dto };
    if (dto.flightNumber !== undefined) {
      payload.flightNumber = dto.flightNumber.trim().toUpperCase();
    }
    if (dto.departureTime !== undefined) {
      payload.departureTime = new Date(dto.departureTime);
    }
    if (dto.arrivalTime !== undefined) {
      payload.arrivalTime = new Date(dto.arrivalTime);
    }

    return super.update(id, payload, actorUserId);
  }

  private async assertAirlineExists(airlineId: string): Promise<void> {
    const row = await this.airlinesRepository.findOne({ where: { id: airlineId } });
    if (!row) {
      throw new NotFoundException('Compagnie aérienne introuvable.');
    }
  }

  private async assertAirportExists(airportId: string): Promise<void> {
    const row = await this.airportsRepository.findOne({ where: { id: airportId } });
    if (!row) {
      throw new NotFoundException('Aéroport introuvable.');
    }
  }
}
