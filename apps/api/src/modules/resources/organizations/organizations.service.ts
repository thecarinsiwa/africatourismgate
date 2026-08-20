import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizations } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class OrganizationsService extends CrudService<Organizations> {
  constructor(
    @InjectRepository(Organizations)
    repository: Repository<Organizations>,
  ) {
    super(repository);
  }
}
