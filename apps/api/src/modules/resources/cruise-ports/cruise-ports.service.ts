import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CruisePorts } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class CruisePortsService extends CrudService<CruisePorts> {
  constructor(
    @InjectRepository(CruisePorts)
    repository: Repository<CruisePorts>,
  ) {
    super(repository);
  }
}
