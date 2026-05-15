import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookings } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class BookingsService extends CrudService<Bookings> {
  constructor(
    @InjectRepository(Bookings)
    repository: Repository<Bookings>,
  ) {
    super(repository);
  }
}
