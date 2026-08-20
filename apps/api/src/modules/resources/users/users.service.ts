import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class UsersService extends CrudService<Users> {
  constructor(
    @InjectRepository(Users)
    repository: Repository<Users>,
  ) {
    super(repository);
  }
}
