import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailOperationVerifications } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class EmailOperationVerificationsService extends CrudService<EmailOperationVerifications> {
  constructor(
    @InjectRepository(EmailOperationVerifications)
    repository: Repository<EmailOperationVerifications>,
  ) {
    super(repository);
  }
}
