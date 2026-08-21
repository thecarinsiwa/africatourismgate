import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { RentalAgencies } from '../../../entities/generated';
import { RentalAgenciesListQueryDto } from './dto/rental-agencies-list-query.dto';

@Injectable()
export class RentalAgenciesService extends CrudService<RentalAgencies> {
  constructor(
    @InjectRepository(RentalAgencies)
    private readonly rentalAgenciesRepository: Repository<RentalAgencies>,
  ) {
    super(rentalAgenciesRepository);
  }

  override async findAll(
    query: RentalAgenciesListQueryDto,
  ): Promise<PaginatedResult<RentalAgencies>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.rentalAgenciesRepository
      .createQueryBuilder('agency')
      .where('agency.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(agency.name LIKE :term OR agency.address LIKE :term)', {
        term: `%${search}%`,
      });
    }

    if (query.destinationId) {
      qb.andWhere('agency.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    if (query.hasAddress === true) {
      qb.andWhere("agency.address IS NOT NULL AND agency.address <> ''");
    } else if (query.hasAddress === false) {
      qb.andWhere("(agency.address IS NULL OR agency.address = '')");
    }

    if (query.hasDestination === true) {
      qb.andWhere('agency.destinationId IS NOT NULL');
    } else if (query.hasDestination === false) {
      qb.andWhere('agency.destinationId IS NULL');
    }

    qb.orderBy('agency.createdAt', 'DESC')
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
}
