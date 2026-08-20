import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlightImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class FlightImagesService extends CrudService<FlightImages> {
  constructor(
    @InjectRepository(FlightImages)
    repository: Repository<FlightImages>,
  ) {
    super(repository);
  }
}
