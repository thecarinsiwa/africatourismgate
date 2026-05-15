import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airports } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class AirportsService extends CrudService<Airports> {
  constructor(
    @InjectRepository(Airports)
    repository: Repository<Airports>,
  ) {
    super(repository);
  }
}
