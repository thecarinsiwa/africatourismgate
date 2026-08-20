import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlightClasses } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class FlightClassesService extends CrudService<FlightClasses> {
  constructor(
    @InjectRepository(FlightClasses)
    repository: Repository<FlightClasses>,
  ) {
    super(repository);
  }
}
