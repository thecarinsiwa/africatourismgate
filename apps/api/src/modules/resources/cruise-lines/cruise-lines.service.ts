import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CruiseLines } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class CruiseLinesService extends CrudService<CruiseLines> {
  constructor(
    @InjectRepository(CruiseLines)
    repository: Repository<CruiseLines>,
  ) {
    super(repository);
  }
}
