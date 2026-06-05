import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissions } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PermissionsService extends CrudService<Permissions> {
  constructor(
    @InjectRepository(Permissions)
    repository: Repository<Permissions>,
  ) {
    super(repository);
  }
}
