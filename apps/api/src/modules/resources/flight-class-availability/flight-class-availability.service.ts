import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlightClassAvailability } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class FlightClassAvailabilityService extends CrudService<FlightClassAvailability> {
  constructor(
    @InjectRepository(FlightClassAvailability)
    repository: Repository<FlightClassAvailability>,
  ) {
    super(repository);
  }
}
