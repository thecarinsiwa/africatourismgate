import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CabinAvailability } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class CabinAvailabilityService extends CrudService<CabinAvailability> {
  constructor(
    @InjectRepository(CabinAvailability)
    repository: Repository<CabinAvailability>,
  ) {
    super(repository);
  }
}
