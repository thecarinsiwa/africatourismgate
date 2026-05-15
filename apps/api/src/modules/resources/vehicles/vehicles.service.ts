import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicles } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class VehiclesService extends CrudService<Vehicles> {
  constructor(
    @InjectRepository(Vehicles)
    repository: Repository<Vehicles>,
  ) {
    super(repository);
  }
}
