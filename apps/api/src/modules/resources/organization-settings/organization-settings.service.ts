import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationSettings } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class OrganizationSettingsService extends CrudService<OrganizationSettings> {
  constructor(
    @InjectRepository(OrganizationSettings)
    repository: Repository<OrganizationSettings>,
  ) {
    super(repository);
  }
}
