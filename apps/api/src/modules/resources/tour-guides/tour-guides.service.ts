import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourGuides } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class TourGuidesService extends CrudService<TourGuides> {
  constructor(
    @InjectRepository(TourGuides)
    repository: Repository<TourGuides>,
  ) {
    super(repository);
  }
}
