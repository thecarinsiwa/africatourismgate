import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reviews } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ReviewsService extends CrudService<Reviews> {
  constructor(
    @InjectRepository(Reviews)
    repository: Repository<Reviews>,
  ) {
    super(repository);
  }
}
