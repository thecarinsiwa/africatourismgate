import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RbacAuditLogs } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class RbacAuditLogsService extends CrudService<RbacAuditLogs> {
  constructor(
    @InjectRepository(RbacAuditLogs)
    repository: Repository<RbacAuditLogs>,
  ) {
    super(repository);
  }
}
