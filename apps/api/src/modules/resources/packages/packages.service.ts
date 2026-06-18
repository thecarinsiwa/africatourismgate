import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PackageItems, PackageImages, Packages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PackageDetailDto, PackageGalleryImageDto } from './dto/package-detail.dto';
import { PackagesListQueryDto } from './dto/packages-list-query.dto';
import { PackageItemPricingService } from './package-item-pricing.service';

@Injectable()
export class PackagesService extends CrudService<Packages> {
  constructor(
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,
    @InjectRepository(PackageItems)
    private readonly packageItemsRepository: Repository<PackageItems>,
    @InjectRepository(PackageImages)
    private readonly packageImagesRepository: Repository<PackageImages>,
    private readonly pricingService: PackageItemPricingService,
  ) {
    super(packagesRepository);
  }

  override async findAll(query: PackagesListQueryDto): Promise<PaginatedResult<Packages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.packagesRepository
      .createQueryBuilder('pkg')
      .where('pkg.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('pkg.name LIKE :term', { term: `%${search}%` });
    }

    if (query.active !== undefined) {
      qb.andWhere('pkg.active = :active', { active: query.active ? 1 : 0 });
    }

    qb.orderBy('pkg.createdAt', 'DESC')
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

  async findOneDetail(id: string): Promise<PackageDetailDto> {
    const pkg = await this.findOne(id);
    const rows = await this.packageItemsRepository.find({
      where: { packageId: id },
    });
    const activeRows = rows.filter((row) => !row.deletedAt);

    const enriched = await Promise.allSettled(
      activeRows.map((row) => this.pricingService.enrichItem(row)),
    );
    const items = enriched.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    );

    const discountPercent = Number(pkg.discountPercent);
    const pricing = this.pricingService.computePricing(items, discountPercent);
    const images = await this.loadPackageGallery(id);

    return { package: pkg, items, pricing, images };
  }

  async findPrimaryImageUrlsByPackageIds(
    packageIds: string[],
  ): Promise<Map<string, string>> {
    if (!packageIds.length) {
      return new Map();
    }

    const rows = await this.packageImagesRepository.find({
      where: { packageId: In(packageIds) },
      order: { sortOrder: 'ASC' },
    });
    const imageUrlByPackageId = new Map<string, string>();
    for (const row of rows) {
      if (!row.deletedAt && !imageUrlByPackageId.has(row.packageId)) {
        imageUrlByPackageId.set(row.packageId, row.url);
      }
    }
    return imageUrlByPackageId;
  }

  private async loadPackageGallery(packageId: string): Promise<PackageGalleryImageDto[]> {
    const rows = await this.packageImagesRepository.find({
      where: { packageId },
      order: { sortOrder: 'ASC' },
    });
    return rows
      .filter((row) => !row.deletedAt)
      .map((row) => ({
        id: row.id,
        url: row.url,
        caption: row.caption ?? null,
        sortOrder: row.sortOrder,
      }));
  }
}
