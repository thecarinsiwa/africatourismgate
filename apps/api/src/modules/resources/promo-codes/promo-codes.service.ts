import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCodes } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PromoCodesService extends CrudService<PromoCodes> {
  constructor(
    @InjectRepository(PromoCodes)
    repository: Repository<PromoCodes>,
  ) {
    super(repository);
  }
}
