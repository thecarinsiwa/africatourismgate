import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingMessages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class BookingMessagesService extends CrudService<BookingMessages> {
  constructor(
    @InjectRepository(BookingMessages)
    repository: Repository<BookingMessages>,
  ) {
    super(repository);
  }
}
