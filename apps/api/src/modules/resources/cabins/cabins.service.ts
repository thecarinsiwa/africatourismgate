import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cabins } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class CabinsService extends CrudService<Cabins> {
  constructor(
    @InjectRepository(Cabins)
    repository: Repository<Cabins>,
  ) {
    super(repository);
  }
}
