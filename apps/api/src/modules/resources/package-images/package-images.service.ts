import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { PackageImages } from '../../../entities/generated';
import { PackageImagesListQueryDto } from './dto/package-images-list-query.dto';

@Injectable()
export class PackageImagesService extends CrudService<PackageImages> {
  constructor(
    @InjectRepository(PackageImages)
    private readonly packageImagesRepository: Repository<PackageImages>,
  ) {
    super(packageImagesRepository);
  }

  override async findAll(
    query: PackageImagesListQueryDto,
  ): Promise<PaginatedResult<PackageImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.packageImagesRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.packageId ? { packageId: query.packageId } : {}),
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
