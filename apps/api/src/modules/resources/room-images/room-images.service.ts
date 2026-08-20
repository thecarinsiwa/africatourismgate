import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class RoomImagesService extends CrudService<RoomImages> {
  constructor(
    @InjectRepository(RoomImages)
    repository: Repository<RoomImages>,
  ) {
    super(repository);
  }
}
