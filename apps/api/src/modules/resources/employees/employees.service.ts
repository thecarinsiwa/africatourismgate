import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employees } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class EmployeesService extends CrudService<Employees> {
  constructor(
    @InjectRepository(Employees)
    repository: Repository<Employees>,
  ) {
    super(repository);
  }
}
