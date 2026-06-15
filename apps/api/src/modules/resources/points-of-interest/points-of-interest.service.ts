import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PointsOfInterest } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreatePointOfInterestDto } from './dto/create-point-of-interest.dto';
import { PointsOfInterestListQueryDto } from './dto/points-of-interest-list-query.dto';
import { UpdatePointOfInterestDto } from './dto/update-point-of-interest.dto';

@Injectable()
export class PointsOfInterestService extends CrudService<PointsOfInterest> {
  constructor(
    @InjectRepository(PointsOfInterest)
    private readonly pointsOfInterestRepository: Repository<PointsOfInterest>,
  ) {
    super(pointsOfInterestRepository);
  }

  createFromDto(dto: CreatePointOfInterestDto, actorUserId?: string): Promise<PointsOfInterest> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updateFromDto(
    id: string,
    dto: UpdatePointOfInterestDto,
    actorUserId?: string,
  ): Promise<PointsOfInterest> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreatePointOfInterestDto | UpdatePointOfInterestDto,
  ): DeepPartial<PointsOfInterest> {
    const { latitude, longitude, ...rest } = dto;
    const payload: DeepPartial<PointsOfInterest> = { ...rest };

    if (latitude !== undefined) {
      payload.latitude = latitude === null ? null : String(latitude);
    }
    if (longitude !== undefined) {
      payload.longitude = longitude === null ? null : String(longitude);
    }

    return payload;
  }

  override async findAll(
    query: PointsOfInterestListQueryDto,
  ): Promise<PaginatedResult<PointsOfInterest>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<PointsOfInterest> = {};

    if (query.destinationId) {
      where.destinationId = query.destinationId;
    }

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
