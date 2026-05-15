import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RentalAgencies } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class RentalAgenciesService extends CrudService<RentalAgencies> {
  constructor(
    @InjectRepository(RentalAgencies)
    repository: Repository<RentalAgencies>,
  ) {
    super(repository);
  }
}
