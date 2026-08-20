import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rooms } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class RoomsService extends CrudService<Rooms> {
  constructor(
    @InjectRepository(Rooms)
    repository: Repository<Rooms>,
  ) {
    super(repository);
  }
}
