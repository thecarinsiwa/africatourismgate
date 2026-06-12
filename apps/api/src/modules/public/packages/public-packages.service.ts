import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Packages } from '../../../entities/generated';
import { PackageDetailDto } from '../../resources/packages/dto/package-detail.dto';
import { PackagesService } from '../../resources/packages/packages.service';
import { PublicPackageListItemDto } from './dto/public-package-list-item.dto';
import { PublicPackagesListQueryDto } from './dto/public-packages-list-query.dto';

@Injectable()
export class PublicPackagesService {
  constructor(
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,
    private readonly packagesService: PackagesService,
  ) {}

  async list(
    query: PublicPackagesListQueryDto,
  ): Promise<PaginatedResult<PublicPackageListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.packagesRepository
      .createQueryBuilder('pkg')
      .where('pkg.deletedAt IS NULL')
      .andWhere('pkg.active = 1');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('pkg.name LIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('pkg.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [packages, total] = await qb.getManyAndCount();

    const data = await Promise.all(
      packages.map(async (pkg) => this.toListItem(pkg)),
    );

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

  async getById(id: string): Promise<PackageDetailDto> {
    const pkg = await this.packagesRepository.findOne({ where: { id } });
    if (!pkg || pkg.deletedAt || pkg.active !== 1) {
      throw new NotFoundException('Forfait introuvable.');
    }
    return this.packagesService.findOneDetail(id);
  }

  private async toListItem(pkg: Packages): Promise<PublicPackageListItemDto> {
    const detail = await this.packagesService.findOneDetail(pkg.id);
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      discountPercent: Number(pkg.discountPercent),
      itemCount: detail.items.length,
      pricing: detail.pricing,
    };
  }
}
