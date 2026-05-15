import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenities } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class AmenitiesService extends CrudService<Amenities> {
  constructor(
    @InjectRepository(Amenities)
    repository: Repository<Amenities>,
  ) {
    super(repository);
  }
}
