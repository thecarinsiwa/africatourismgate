import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitySchedules } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ActivitySchedulesService extends CrudService<ActivitySchedules> {
  constructor(
    @InjectRepository(ActivitySchedules)
    repository: Repository<ActivitySchedules>,
  ) {
    super(repository);
  }
}
