import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PropertyImagesService extends CrudService<PropertyImages> {
  constructor(
    @InjectRepository(PropertyImages)
    repository: Repository<PropertyImages>,
  ) {
    super(repository);
  }
}
