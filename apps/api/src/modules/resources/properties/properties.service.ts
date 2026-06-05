import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Properties } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PropertiesService extends CrudService<Properties> {
  constructor(
    @InjectRepository(Properties)
    repository: Repository<Properties>,
  ) {
    super(repository);
  }
}
