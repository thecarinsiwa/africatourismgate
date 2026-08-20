import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyAccounts } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class LoyaltyAccountsService extends CrudService<LoyaltyAccounts> {
  constructor(
    @InjectRepository(LoyaltyAccounts)
    repository: Repository<LoyaltyAccounts>,
  ) {
    super(repository);
  }
}
