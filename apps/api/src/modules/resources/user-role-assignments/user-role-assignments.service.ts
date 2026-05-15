import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleAssignments } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class UserRoleAssignmentsService extends CrudService<UserRoleAssignments> {
  constructor(
    @InjectRepository(UserRoleAssignments)
    repository: Repository<UserRoleAssignments>,
  ) {
    super(repository);
  }
}
