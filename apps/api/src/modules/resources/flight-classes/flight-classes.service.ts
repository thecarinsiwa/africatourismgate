import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { FlightClasses, Flights } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateFlightClassDto } from './dto/create-flight-class.dto';
import { FlightClassesListQueryDto } from './dto/flight-classes-list-query.dto';
import { UpdateFlightClassDto } from './dto/update-flight-class.dto';

@Injectable()
export class FlightClassesService extends CrudService<FlightClasses> {
  constructor(
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(Flights)
    private readonly flightsRepository: Repository<Flights>,
  ) {
    super(flightClassesRepository);
  }

  override async findAll(
    query: FlightClassesListQueryDto,
  ): Promise<PaginatedResult<FlightClasses>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.flightClassesRepository
      .createQueryBuilder('fc')
      .where('fc.deletedAt IS NULL');

    if (query.flightId) {
      qb.andWhere('fc.flightId = :flightId', { flightId: query.flightId });
    }

    qb.orderBy('fc.className', 'ASC')
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

  async createFlightClass(
    dto: CreateFlightClassDto,
    actorUserId?: string,
  ): Promise<FlightClasses> {
    await this.assertFlightExists(dto.flightId);
    return super.create(dto as DeepPartial<FlightClasses>, actorUserId);
  }

  async updateFlightClass(
    id: string,
    dto: UpdateFlightClassDto,
    actorUserId?: string,
  ): Promise<FlightClasses> {
    return super.update(id, dto as DeepPartial<FlightClasses>, actorUserId);
  }

  private async assertFlightExists(flightId: string): Promise<void> {
    const flight = await this.flightsRepository.findOne({ where: { id: flightId } });
    if (!flight) {
      throw new NotFoundException('Vol introuvable.');
    }
  }
}
