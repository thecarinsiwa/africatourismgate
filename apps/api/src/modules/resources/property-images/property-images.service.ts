import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PropertyImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreatePropertyImageDto } from './dto/create-property-image.dto';
import { PropertyImagesListQueryDto } from './dto/property-images-list-query.dto';
import { UpdatePropertyImageDto } from './dto/update-property-image.dto';

@Injectable()
export class PropertyImagesService extends CrudService<PropertyImages> {
  constructor(
    @InjectRepository(PropertyImages)
    private readonly imagesRepository: Repository<PropertyImages>,
  ) {
    super(imagesRepository);
  }

  override async findAll(
    query: PropertyImagesListQueryDto,
  ): Promise<PaginatedResult<PropertyImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.imagesRepository
      .createQueryBuilder('img')
      .where('img.deletedAt IS NULL');

    if (query.propertyId) {
      qb.andWhere('img.propertyId = :propertyId', {
        propertyId: query.propertyId,
      });
    }

    qb.orderBy('img.sortOrder', 'ASC')
      .addOrderBy('img.createdAt', 'DESC')
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

  createImage(
    dto: CreatePropertyImageDto,
    actorUserId?: string,
  ): Promise<PropertyImages> {
    return super.create(
      {
        ...dto,
        sortOrder: dto.sortOrder ?? 0,
      } as DeepPartial<PropertyImages>,
      actorUserId,
    );
  }

  updateImage(
    id: string,
    dto: UpdatePropertyImageDto,
    actorUserId?: string,
  ): Promise<PropertyImages> {
    return super.update(id, dto as DeepPartial<PropertyImages>, actorUserId);
  }
}
