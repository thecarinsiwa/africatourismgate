import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationBankAccounts } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class OrganizationBankAccountsService extends CrudService<OrganizationBankAccounts> {
  constructor(
    @InjectRepository(OrganizationBankAccounts)
    repository: Repository<OrganizationBankAccounts>,
  ) {
    super(repository);
  }
}
