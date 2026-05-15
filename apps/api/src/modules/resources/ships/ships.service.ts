import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ships } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ShipsService extends CrudService<Ships> {
  constructor(
    @InjectRepository(Ships)
    repository: Repository<Ships>,
  ) {
    super(repository);
  }
}
