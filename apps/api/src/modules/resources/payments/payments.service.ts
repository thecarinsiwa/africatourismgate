import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payments } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PaymentsService extends CrudService<Payments> {
  constructor(
    @InjectRepository(Payments)
    repository: Repository<Payments>,
  ) {
    super(repository);
  }
}
