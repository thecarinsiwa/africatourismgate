import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { PropertyImages } from '../../../entities/generated';
import { PropertyImagesListQueryDto } from './dto/property-images-list-query.dto';

@Injectable()
export class PropertyImagesService extends CrudService<PropertyImages> {
  constructor(
    @InjectRepository(PropertyImages)
    private readonly propertyImagesRepository: Repository<PropertyImages>,
  ) {
    super(propertyImagesRepository);
  }

  override async findAll(
    query: PropertyImagesListQueryDto,
  ): Promise<PaginatedResult<PropertyImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.propertyImagesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.propertyId ? { propertyId: query.propertyId } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
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
