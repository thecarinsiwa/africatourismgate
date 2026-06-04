import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airlines } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class AirlinesService extends CrudService<Airlines> {
  constructor(
    @InjectRepository(Airlines)
    repository: Repository<Airlines>,
  ) {
    super(repository);
  }
}
