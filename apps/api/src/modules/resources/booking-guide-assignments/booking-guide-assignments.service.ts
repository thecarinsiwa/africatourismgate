import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingGuideAssignments } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class BookingGuideAssignmentsService extends CrudService<BookingGuideAssignments> {
  constructor(
    @InjectRepository(BookingGuideAssignments)
    repository: Repository<BookingGuideAssignments>,
  ) {
    super(repository);
  }
}
