import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityProviders } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ActivityProvidersService extends CrudService<ActivityProviders> {
  constructor(
    @InjectRepository(ActivityProviders)
    repository: Repository<ActivityProviders>,
  ) {
    super(repository);
  }
}
