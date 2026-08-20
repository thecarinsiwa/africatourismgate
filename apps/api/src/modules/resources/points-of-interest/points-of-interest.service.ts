import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointsOfInterest } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class PointsOfInterestService extends CrudService<PointsOfInterest> {
  constructor(
    @InjectRepository(PointsOfInterest)
    repository: Repository<PointsOfInterest>,
  ) {
    super(repository);
  }
}
