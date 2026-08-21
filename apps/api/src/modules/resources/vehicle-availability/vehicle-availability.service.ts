import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { VehicleAvailability } from '../../../entities/generated';
import { VehicleAvailabilityListQueryDto } from './dto/vehicle-availability-list-query.dto';

@Injectable()
export class VehicleAvailabilityService extends CrudService<VehicleAvailability> {
  constructor(
    @InjectRepository(VehicleAvailability)
    private readonly availabilityRepository: Repository<VehicleAvailability>,
  ) {
    super(availabilityRepository);
  }

  override async findAll(
    query: VehicleAvailabilityListQueryDto,
  ): Promise<PaginatedResult<VehicleAvailability>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.availabilityRepository
      .createQueryBuilder('slot')
      .where('slot.deletedAt IS NULL')
      .andWhere('slot.vehicleId = :vehicleId', { vehicleId: query.vehicleId });

    if (query.startFrom) {
      qb.andWhere('slot.endDatetime >= :startFrom', {
        startFrom: query.startFrom,
      });
    }
    if (query.endTo) {
      qb.andWhere('slot.startDatetime <= :endTo', { endTo: query.endTo });
    }

    qb.orderBy('slot.startDatetime', 'ASC')
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
}
