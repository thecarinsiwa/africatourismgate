import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotions } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PromotionsService extends CrudService<Promotions> {
  constructor(
    @InjectRepository(Promotions)
    repository: Repository<Promotions>,
  ) {
    super(repository);
  }
}
