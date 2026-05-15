import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class RolesService extends CrudService<Roles> {
  constructor(
    @InjectRepository(Roles)
    repository: Repository<Roles>,
  ) {
    super(repository);
  }
}
