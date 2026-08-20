import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomAvailability } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class RoomAvailabilityService extends CrudService<RoomAvailability> {
  constructor(
    @InjectRepository(RoomAvailability)
    repository: Repository<RoomAvailability>,
  ) {
    super(repository);
  }
}
