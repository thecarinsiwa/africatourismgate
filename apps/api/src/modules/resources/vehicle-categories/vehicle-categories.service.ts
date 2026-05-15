import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleCategories } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class VehicleCategoriesService extends CrudService<VehicleCategories> {
  constructor(
    @InjectRepository(VehicleCategories)
    repository: Repository<VehicleCategories>,
  ) {
    super(repository);
  }
}
