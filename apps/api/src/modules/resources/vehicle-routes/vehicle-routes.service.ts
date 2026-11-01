import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { VehicleRoutes, Vehicles } from '../../../entities/generated';
import { CreateVehicleRouteDto } from './dto/create-vehicle-route.dto';
import { UpdateVehicleRouteDto } from './dto/update-vehicle-route.dto';
import { VehicleRoutesListQueryDto } from './dto/vehicle-routes-list-query.dto';

function normalizeCity(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

@Injectable()
export class VehicleRoutesService extends CrudService<VehicleRoutes> {
  constructor(
    @InjectRepository(VehicleRoutes)
    private readonly vehicleRoutesRepository: Repository<VehicleRoutes>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
  ) {
    super(vehicleRoutesRepository);
  }

  override async findAll(
    query: VehicleRoutesListQueryDto,
  ): Promise<PaginatedResult<VehicleRoutes>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.vehicleRoutesRepository
      .createQueryBuilder('route')
      .where('route.deletedAt IS NULL');

    if (query.vehicleId) {
      qb.andWhere('route.vehicleId = :vehicleId', { vehicleId: query.vehicleId });
    }
    if (query.departureCity?.trim()) {
      qb.andWhere('route.departureCity LIKE :departureCity', {
        departureCity: `%${normalizeCity(query.departureCity)}%`,
      });
    }
    if (query.arrivalCity?.trim()) {
      qb.andWhere('route.arrivalCity LIKE :arrivalCity', {
        arrivalCity: `%${normalizeCity(query.arrivalCity)}%`,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(route.departureCity LIKE :term OR route.arrivalCity LIKE :term)',
        { term: `%${search}%` },
      );
    }

    qb.orderBy('route.createdAt', 'DESC')
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

  async createRoute(dto: CreateVehicleRouteDto): Promise<VehicleRoutes> {
    await this.assertVehicleExists(dto.vehicleId);
    const departureCity = normalizeCity(dto.departureCity);
    const arrivalCity = normalizeCity(dto.arrivalCity);
    this.assertDistinctCities(departureCity, arrivalCity);
    await this.assertUniqueRoute(dto.vehicleId, departureCity, arrivalCity);

    return this.create({
      vehicleId: dto.vehicleId,
      departureCity,
      arrivalCity,
      priceCents: dto.priceCents,
      currency: dto.currency.toUpperCase(),
    });
  }

  async updateRoute(id: string, dto: UpdateVehicleRouteDto): Promise<VehicleRoutes> {
    const existing = await this.findOne(id);
    if (existing.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const departureCity =
      dto.departureCity !== undefined
        ? normalizeCity(dto.departureCity)
        : existing.departureCity;
    const arrivalCity =
      dto.arrivalCity !== undefined
        ? normalizeCity(dto.arrivalCity)
        : existing.arrivalCity;

    this.assertDistinctCities(departureCity, arrivalCity);
    await this.assertUniqueRoute(existing.vehicleId, departureCity, arrivalCity, id);

    return this.update(id, {
      ...(dto.departureCity !== undefined ? { departureCity } : {}),
      ...(dto.arrivalCity !== undefined ? { arrivalCity } : {}),
      ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency.toUpperCase() } : {}),
    });
  }

  private async assertVehicleExists(vehicleId: string): Promise<void> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, deletedAt: IsNull() },
    });
    if (!vehicle) {
      throw new NotFoundException('Véhicule introuvable.');
    }
  }

  private assertDistinctCities(departureCity: string, arrivalCity: string): void {
    if (!departureCity || !arrivalCity) {
      throw new BadRequestException('Départ et arrivée sont obligatoires.');
    }
    if (departureCity.toLowerCase() === arrivalCity.toLowerCase()) {
      throw new BadRequestException(
        'La ville de départ et d’arrivée doivent être distinctes.',
      );
    }
  }

  private async assertUniqueRoute(
    vehicleId: string,
    departureCity: string,
    arrivalCity: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.vehicleRoutesRepository.findOne({
      where: {
        vehicleId,
        departureCity,
        arrivalCity,
        deletedAt: IsNull(),
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });
    if (existing) {
      throw new ConflictException(
        'Un tronçon existe déjà pour ce véhicule et ce couple départ / arrivée.',
      );
    }
  }
}
