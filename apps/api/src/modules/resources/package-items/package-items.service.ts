import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { PackageItems } from '../../../entities/generated';
import { PackageItemsListQueryDto } from './dto/package-items-list-query.dto';

@Injectable()
export class PackageItemsService extends CrudService<PackageItems> {
  constructor(
    @InjectRepository(PackageItems)
    private readonly packageItemsRepository: Repository<PackageItems>,
  ) {
    super(packageItemsRepository);
  }

  override async findAll(
    query: PackageItemsListQueryDto,
  ): Promise<PaginatedResult<PackageItems>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.packageItemsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.packageId ? { packageId: query.packageId } : {}),
      },
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
