import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
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
    const where: FindOptionsWhere<PackageDescriptionAssets> = {};

    if (query.packageId) {
      where.packageId = query.packageId;
    }
    if (query.assetType) {
      where.assetType = query.assetType;
    }

    const [data, total] = await this.packageDescriptionAssetsRepository.findAndCount({
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
