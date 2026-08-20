import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ActivityImagesService extends CrudService<ActivityImages> {
  constructor(
    @InjectRepository(ActivityImages)
    repository: Repository<ActivityImages>,
  ) {
    super(repository);
  }
}
