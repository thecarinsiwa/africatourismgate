import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItineraryPorts } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ItineraryPortsService extends CrudService<ItineraryPorts> {
  constructor(
    @InjectRepository(ItineraryPorts)
    repository: Repository<ItineraryPorts>,
  ) {
    super(repository);
  }
}
