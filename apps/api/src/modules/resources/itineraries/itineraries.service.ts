import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Itineraries } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ItinerariesService extends CrudService<Itineraries> {
  constructor(
    @InjectRepository(Itineraries)
    repository: Repository<Itineraries>,
  ) {
    super(repository);
  }
}
