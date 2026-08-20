import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ShipImagesService extends CrudService<ShipImages> {
  constructor(
    @InjectRepository(ShipImages)
    repository: Repository<ShipImages>,
  ) {
    super(repository);
  }
}
