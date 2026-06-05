import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetTokens } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PasswordResetTokensService extends CrudService<PasswordResetTokens> {
  constructor(
    @InjectRepository(PasswordResetTokens)
    repository: Repository<PasswordResetTokens>,
  ) {
    super(repository);
  }
}
