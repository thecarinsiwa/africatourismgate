import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { VehicleAvailability, Vehicles } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreateVehicleAvailabilityDto } from './dto/create-vehicle-availability.dto';
import { UpdateVehicleAvailabilityDto } from './dto/update-vehicle-availability.dto';
import { VehicleAvailabilityListQueryDto } from './dto/vehicle-availability-list-query.dto';

@Injectable()
export class VehicleAvailabilityService extends CrudService<VehicleAvailability> {
  constructor(
    @InjectRepository(VehicleAvailability)
    private readonly availabilityRepository: Repository<VehicleAvailability>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
  ) {
    super(availabilityRepository);
  }

  override async findAll(
    query: VehicleAvailabilityListQueryDto,
  ): Promise<PaginatedResult<VehicleAvailability>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.availabilityRepository
      .createQueryBuilder('va')
      .where('va.deletedAt IS NULL')
      .andWhere('va.vehicleId = :vehicleId', { vehicleId: query.vehicleId });

    if (query.startFrom) {
      qb.andWhere('va.endDatetime >= :startFrom', { startFrom: query.startFrom });
    }
    if (query.endTo) {
      qb.andWhere('va.startDatetime <= :endTo', { endTo: query.endTo });
    }

    qb.orderBy('va.startDatetime', 'ASC')
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
    dto: CreateVehicleAvailabilityDto,
    actorUserId?: string,
  ): Promise<VehicleAvailability> {
    this.assertValidRange(dto.startDatetime, dto.endDatetime);
    await this.assertVehicleExists(dto.vehicleId);

    return super.create(
      {
        vehicleId: dto.vehicleId,
        startDatetime: dto.startDatetime,
        endDatetime: dto.endDatetime,
        status: dto.status ?? 'available',
      } as DeepPartial<VehicleAvailability>,
      actorUserId,
    );
  }

  async updateAvailability(
    id: string,
    dto: UpdateVehicleAvailabilityDto,
    actorUserId?: string,
  ): Promise<VehicleAvailability> {
    if (dto.startDatetime && dto.endDatetime) {
      this.assertValidRange(dto.startDatetime, dto.endDatetime);
    }

    return super.update(id, dto as DeepPartial<VehicleAvailability>, actorUserId);
  }

  private assertValidRange(startDatetime: string, endDatetime: string): void {
    if (new Date(endDatetime).getTime() <= new Date(startDatetime).getTime()) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début.',
      );
    }
  }

  private async assertVehicleExists(vehicleId: string): Promise<void> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException('Véhicule introuvable.');
    }
  }
}
