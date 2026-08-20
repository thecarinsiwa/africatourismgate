import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flights } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class FlightsService extends CrudService<Flights> {
  constructor(
    @InjectRepository(Flights)
    repository: Repository<Flights>,
  ) {
    super(repository);
  }
}
