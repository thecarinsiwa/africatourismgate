import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { PackageDescriptionAssets } from '../../../entities/generated';
import { PackageDescriptionAssetsListQueryDto } from './dto/package-description-assets-list-query.dto';

@Injectable()
export class PackageDescriptionAssetsService extends CrudService<PackageDescriptionAssets> {
  constructor(
    @InjectRepository(PackageDescriptionAssets)
    private readonly packageDescriptionAssetsRepository: Repository<PackageDescriptionAssets>,
  ) {
    super(packageDescriptionAssetsRepository);
  }

  override async findAll(
    query: PackageDescriptionAssetsListQueryDto,
  ): Promise<PaginatedResult<PackageDescriptionAssets>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.packageDescriptionAssetsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.packageId ? { packageId: query.packageId } : {}),
        ...(query.assetType ? { assetType: query.assetType } : {}),
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
