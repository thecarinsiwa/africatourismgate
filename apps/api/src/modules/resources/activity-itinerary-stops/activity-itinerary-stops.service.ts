import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityItineraryStops } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ActivityItineraryStopsService extends CrudService<ActivityItineraryStops> {
  constructor(
    @InjectRepository(ActivityItineraryStops)
    repository: Repository<ActivityItineraryStops>,
  ) {
    super(repository);
  }
}
