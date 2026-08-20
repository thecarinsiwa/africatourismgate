import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class VehicleImagesService extends CrudService<VehicleImages> {
  constructor(
    @InjectRepository(VehicleImages)
    repository: Repository<VehicleImages>,
  ) {
    super(repository);
  }
}
