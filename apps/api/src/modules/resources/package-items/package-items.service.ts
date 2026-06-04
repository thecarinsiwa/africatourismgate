import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageItems } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PackageItemsService extends CrudService<PackageItems> {
  constructor(
    @InjectRepository(PackageItems)
    repository: Repository<PackageItems>,
  ) {
    super(repository);
  }
}
