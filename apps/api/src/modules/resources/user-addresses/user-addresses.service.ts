import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddresses } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class UserAddressesService extends CrudService<UserAddresses> {
  constructor(
    @InjectRepository(UserAddresses)
    repository: Repository<UserAddresses>,
  ) {
    super(repository);
  }
}
