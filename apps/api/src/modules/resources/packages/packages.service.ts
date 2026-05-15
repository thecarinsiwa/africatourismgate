import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Packages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PackagesService extends CrudService<Packages> {
  constructor(
    @InjectRepository(Packages)
    repository: Repository<Packages>,
  ) {
    super(repository);
  }
}
