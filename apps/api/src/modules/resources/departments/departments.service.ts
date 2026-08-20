import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departments } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class DepartmentsService extends CrudService<Departments> {
  constructor(
    @InjectRepository(Departments)
    repository: Repository<Departments>,
  ) {
    super(repository);
  }
}
