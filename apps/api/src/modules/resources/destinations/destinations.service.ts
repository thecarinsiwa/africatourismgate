import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destinations } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class DestinationsService extends CrudService<Destinations> {
  constructor(
    @InjectRepository(Destinations)
    repository: Repository<Destinations>,
  ) {
    super(repository);
  }
}
