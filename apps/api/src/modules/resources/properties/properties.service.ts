import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Properties } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PropertiesListQueryDto } from './dto/properties-list-query.dto';

@Injectable()
export class PropertiesService extends CrudService<Properties> {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
  ) {
    super(propertiesRepository);
  }

  override async findAll(
    query: PropertiesListQueryDto,
  ): Promise<PaginatedResult<Properties>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(property.name LIKE :term OR property.slug LIKE :term)', {
        term: `%${search}%`,
      });
    }

    if (query.destinationId) {
      qb.andWhere('property.destinationId = :destinationId', {
        destinationId: query.destinationId,
      });
    }

    qb.orderBy('property.createdAt', 'DESC')
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
