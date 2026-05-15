import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPaymentMethods } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class UserPaymentMethodsService extends CrudService<UserPaymentMethods> {
  constructor(
    @InjectRepository(UserPaymentMethods)
    repository: Repository<UserPaymentMethods>,
  ) {
    super(repository);
  }
}
