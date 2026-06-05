import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CruiseSailings } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class CruiseSailingsService extends CrudService<CruiseSailings> {
  constructor(
    @InjectRepository(CruiseSailings)
    repository: Repository<CruiseSailings>,
  ) {
    super(repository);
  }
}
