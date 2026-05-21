import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Airports } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { AirportsListQueryDto } from './dto/airports-list-query.dto';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Injectable()
export class AirportsService extends CrudService<Airports> {
  constructor(
    @InjectRepository(Airports)
    private readonly airportsRepository: Repository<Airports>,
  ) {
    super(airportsRepository);
  }

  override async findAll(
    query: AirportsListQueryDto,
  ): Promise<PaginatedResult<Airports>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.airportsRepository
      .createQueryBuilder('airport')
      .where('airport.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(airport.iataCode) LIKE :pattern', { pattern })
            .orWhere('LOWER(airport.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(airport.city) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('airport.city', 'ASC')
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

  async createAirport(dto: CreateAirportDto, actorUserId?: string): Promise<Airports> {
    const iataCode = dto.iataCode.trim().toUpperCase();
    await this.assertIataAvailable(iataCode);
    return super.create(
      {
        iataCode,
        name: dto.name.trim(),
        city: dto.city.trim(),
        countryCode: dto.countryCode.trim().toUpperCase(),
        ...(dto.latitude !== undefined
          ? { latitude: dto.latitude == null ? null : String(dto.latitude) }
          : {}),
        ...(dto.longitude !== undefined
          ? { longitude: dto.longitude == null ? null : String(dto.longitude) }
          : {}),
      } as DeepPartial<Airports>,
      actorUserId,
    );
  }

  async updateAirport(
    id: string,
    dto: UpdateAirportDto,
    actorUserId?: string,
  ): Promise<Airports> {
    const payload: DeepPartial<Airports> = {};
    if (dto.iataCode !== undefined) {
      const iataCode = dto.iataCode.trim().toUpperCase();
      await this.assertIataAvailable(iataCode, id);
      payload.iataCode = iataCode;
    }
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.city !== undefined) payload.city = dto.city.trim();
    if (dto.countryCode !== undefined) {
      payload.countryCode = dto.countryCode.trim().toUpperCase();
    }
    if (dto.latitude !== undefined && dto.latitude != null) {
      payload.latitude = String(dto.latitude);
    }
    if (dto.longitude !== undefined && dto.longitude != null) {
      payload.longitude = String(dto.longitude);
    }
    return super.update(id, payload, actorUserId);
  }

  private async assertIataAvailable(iataCode: string, excludeId?: string): Promise<void> {
    const existing = await this.airportsRepository.findOne({ where: { iataCode } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Ce code IATA est déjà utilisé par un autre aéroport.');
    }
  }
}
