import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activities } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ActivitiesService extends CrudService<Activities> {
  constructor(
    @InjectRepository(Activities)
    repository: Repository<Activities>,
  ) {
    super(repository);
  }
}
