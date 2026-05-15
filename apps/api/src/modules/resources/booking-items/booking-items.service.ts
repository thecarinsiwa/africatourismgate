import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingItems } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class BookingItemsService extends CrudService<BookingItems> {
  constructor(
    @InjectRepository(BookingItems)
    repository: Repository<BookingItems>,
  ) {
    super(repository);
  }
}
