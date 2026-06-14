import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PackageImages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
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
    const where: FindOptionsWhere<PackageImages> = {};
    if (query.packageId) {
      where.packageId = query.packageId;
    }
    const [data, total] = await this.packageImagesRepository.findAndCount({
      where,
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
