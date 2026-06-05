import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleAvailability } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class VehicleAvailabilityService extends CrudService<VehicleAvailability> {
  constructor(
    @InjectRepository(VehicleAvailability)
    repository: Repository<VehicleAvailability>,
  ) {
    super(repository);
  }
}
