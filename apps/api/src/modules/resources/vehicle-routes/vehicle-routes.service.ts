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
import {
  Destinations,
  VehicleRoutes,
  Vehicles,
} from '../../../entities/generated';
import { CreateVehicleRouteDto } from './dto/create-vehicle-route.dto';
import { UpdateVehicleRouteDto } from './dto/update-vehicle-route.dto';
import { VehicleRoutesListQueryDto } from './dto/vehicle-routes-list-query.dto';

@Injectable()
export class VehicleRoutesService extends CrudService<VehicleRoutes> {
  constructor(
    @InjectRepository(VehicleRoutes)
    private readonly vehicleRoutesRepository: Repository<VehicleRoutes>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(Destinations)
    private readonly destinationsRepository: Repository<Destinations>,
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
    if (query.departureDestinationId) {
      qb.andWhere('route.departureDestinationId = :departureDestinationId', {
        departureDestinationId: query.departureDestinationId,
      });
    }
    if (query.arrivalDestinationId) {
      qb.andWhere('route.arrivalDestinationId = :arrivalDestinationId', {
        arrivalDestinationId: query.arrivalDestinationId,
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.leftJoin(
        Destinations,
        'dep',
        'dep.id = route.departureDestinationId AND dep.deletedAt IS NULL',
      ).leftJoin(
        Destinations,
        'arr',
        'arr.id = route.arrivalDestinationId AND arr.deletedAt IS NULL',
      );
      qb.andWhere('(dep.name LIKE :term OR arr.name LIKE :term)', {
        term: `%${search}%`,
      });
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
    await this.assertDestinations(dto.departureDestinationId, dto.arrivalDestinationId);
    await this.assertUniqueRoute(
      dto.vehicleId,
      dto.departureDestinationId,
      dto.arrivalDestinationId,
    );

    return this.create({
      vehicleId: dto.vehicleId,
      departureDestinationId: dto.departureDestinationId,
      arrivalDestinationId: dto.arrivalDestinationId,
      priceCents: dto.priceCents,
      currency: dto.currency.toUpperCase(),
    });
  }

  async updateRoute(id: string, dto: UpdateVehicleRouteDto): Promise<VehicleRoutes> {
    const existing = await this.findOne(id);
    if (existing.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const departureDestinationId =
      dto.departureDestinationId ?? existing.departureDestinationId;
    const arrivalDestinationId =
      dto.arrivalDestinationId ?? existing.arrivalDestinationId;

    await this.assertDestinations(departureDestinationId, arrivalDestinationId);
    await this.assertUniqueRoute(
      existing.vehicleId,
      departureDestinationId,
      arrivalDestinationId,
      id,
    );

    return this.update(id, {
      ...(dto.departureDestinationId !== undefined
        ? { departureDestinationId: dto.departureDestinationId }
        : {}),
      ...(dto.arrivalDestinationId !== undefined
        ? { arrivalDestinationId: dto.arrivalDestinationId }
        : {}),
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

  private async assertDestinations(
    departureDestinationId: string,
    arrivalDestinationId: string,
  ): Promise<void> {
    if (departureDestinationId === arrivalDestinationId) {
      throw new BadRequestException(
        'La destination de départ et d’arrivée doivent être distinctes.',
      );
    }

    const destinations = await this.destinationsRepository.find({
      where: [
        { id: departureDestinationId, deletedAt: IsNull() },
        { id: arrivalDestinationId, deletedAt: IsNull() },
      ],
    });
    const ids = new Set(destinations.map((d) => d.id));
    if (!ids.has(departureDestinationId)) {
      throw new NotFoundException('Destination de départ introuvable.');
    }
    if (!ids.has(arrivalDestinationId)) {
      throw new NotFoundException('Destination d’arrivée introuvable.');
    }
  }

  private async assertUniqueRoute(
    vehicleId: string,
    departureDestinationId: string,
    arrivalDestinationId: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.vehicleRoutesRepository.findOne({
      where: {
        vehicleId,
        departureDestinationId,
        arrivalDestinationId,
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
