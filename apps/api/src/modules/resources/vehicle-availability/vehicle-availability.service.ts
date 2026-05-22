import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
      qb.andWhere('va.endDatetime >= :startFrom', {
        startFrom: new Date(query.startFrom),
      });
    }
    if (query.endTo) {
      qb.andWhere('va.startDatetime <= :endTo', {
        endTo: new Date(query.endTo),
      });
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

  async createSlot(
    dto: CreateVehicleAvailabilityDto,
    actorUserId?: string,
  ): Promise<VehicleAvailability> {
    await this.assertVehicleExists(dto.vehicleId);
    const start = new Date(dto.startDatetime);
    const end = new Date(dto.endDatetime);
    this.assertValidRange(start, end);

    return super.create(
      {
        vehicleId: dto.vehicleId,
        startDatetime: start,
        endDatetime: end,
        status: dto.status ?? 'available',
      } as DeepPartial<VehicleAvailability>,
      actorUserId,
    );
  }

  async updateSlot(
    id: string,
    dto: UpdateVehicleAvailabilityDto,
    actorUserId?: string,
  ): Promise<VehicleAvailability> {
    const existing = await this.findOne(id);
    const start = dto.startDatetime
      ? new Date(dto.startDatetime)
      : existing.startDatetime;
    const end = dto.endDatetime ? new Date(dto.endDatetime) : existing.endDatetime;
    this.assertValidRange(start, end);

    const payload: DeepPartial<VehicleAvailability> = {};
    if (dto.startDatetime !== undefined) payload.startDatetime = start;
    if (dto.endDatetime !== undefined) payload.endDatetime = end;
    if (dto.status !== undefined) payload.status = dto.status;

    return super.update(id, payload, actorUserId);
  }

  private assertValidRange(start: Date, end: Date): void {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Dates invalides.');
    }
    if (start >= end) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début.',
      );
    }
  }

  private async assertVehicleExists(vehicleId: string): Promise<void> {
    const row = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
    if (!row) {
      throw new NotFoundException('Véhicule introuvable.');
    }
  }
}
