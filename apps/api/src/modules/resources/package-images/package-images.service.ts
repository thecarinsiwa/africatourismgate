import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PackageImagesService extends CrudService<PackageImages> {
  constructor(
    @InjectRepository(PackageImages)
    repository: Repository<PackageImages>,
  ) {
    super(repository);
  }
}
