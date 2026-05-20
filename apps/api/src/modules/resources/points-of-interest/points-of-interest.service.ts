import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
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
    private readonly poiRepository: Repository<PointsOfInterest>,
  ) {
    super(poiRepository);
  }

  override async findAll(
    query: PointsOfInterestListQueryDto,
  ): Promise<PaginatedResult<PointsOfInterest>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.poiRepository
      .createQueryBuilder('poi')
      .where('poi.deletedAt IS NULL');

    if (query.destinationId) {
      qb.andWhere('poi.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    qb.orderBy('poi.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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

  createPoint(
    dto: CreatePointOfInterestDto,
    actorUserId?: string,
  ): Promise<PointsOfInterest> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updatePoint(
    id: string,
    dto: UpdatePointOfInterestDto,
    actorUserId?: string,
  ): Promise<PointsOfInterest> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreatePointOfInterestDto | UpdatePointOfInterestDto,
  ): DeepPartial<PointsOfInterest> {
    const payload: DeepPartial<PointsOfInterest> = {};
    if ('destinationId' in dto && dto.destinationId) {
      payload.destinationId = dto.destinationId;
    }
    if (dto.name !== undefined) {
      payload.name = dto.name;
    }
    if (dto.latitude !== undefined) {
      payload.latitude = String(dto.latitude);
    }
    if (dto.longitude !== undefined) {
      payload.longitude = String(dto.longitude);
    }
    return payload;
  }
}
