import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { PointsOfInterest } from '../../../entities/generated';
import { PointsOfInterestListQueryDto } from './dto/points-of-interest-list-query.dto';

@Injectable()
export class PointsOfInterestService extends CrudService<PointsOfInterest> {
  constructor(
    @InjectRepository(PointsOfInterest)
    private readonly pointsOfInterestRepository: Repository<PointsOfInterest>,
  ) {
    super(pointsOfInterestRepository);
  }

  override async findAll(
    query: PointsOfInterestListQueryDto,
  ): Promise<PaginatedResult<PointsOfInterest>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<PointsOfInterest> = {
      deletedAt: IsNull(),
      ...(query.destinationId ? { destinationId: query.destinationId } : {}),
    };

    const [data, total] = await this.pointsOfInterestRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
