import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSessions } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class UserSessionsService extends CrudService<UserSessions> {
  constructor(
    @InjectRepository(UserSessions)
    repository: Repository<UserSessions>,
  ) {
    super(repository);
  }
}
