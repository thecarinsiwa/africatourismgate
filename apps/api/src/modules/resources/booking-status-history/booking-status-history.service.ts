import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingStatusHistory } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class BookingStatusHistoryService extends CrudService<BookingStatusHistory> {
  constructor(
    @InjectRepository(BookingStatusHistory)
    repository: Repository<BookingStatusHistory>,
  ) {
    super(repository);
  }
}
