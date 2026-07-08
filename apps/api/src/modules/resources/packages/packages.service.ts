import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  PackageDescriptionAssets,
  PackageItems,
  PackageImages,
  Packages,
} from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import {
  PackageDescriptionAssetDto,
  PackageDetailDto,
  PackageGalleryImageDto,
} from './dto/package-detail.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackagesListQueryDto } from './dto/packages-list-query.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
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
    @InjectRepository(PackageDescriptionAssets)
    private readonly packageDescriptionAssetsRepository: Repository<PackageDescriptionAssets>,
    private readonly pricingService: PackageItemPricingService,
  ) {
    super(packagesRepository);
  }

  createFromDto(dto: CreatePackageDto, actorUserId?: string): Promise<Packages> {
    return this.savePackageDto(dto, undefined, actorUserId);
  }

  updateFromDto(id: string, dto: UpdatePackageDto, actorUserId?: string): Promise<Packages> {
    return this.savePackageDto(dto, id, actorUserId);
  }

  async findFeaturedActive(): Promise<Packages | null> {
    return this.packagesRepository
      .createQueryBuilder('pkg')
      .where('pkg.deletedAt IS NULL')
      .andWhere('pkg.active = 1')
      .andWhere('pkg.isFeatured = 1')
      .orderBy('pkg.updatedAt', 'DESC')
      .addOrderBy('pkg.createdAt', 'DESC')
      .getOne();
  }

  private async savePackageDto(
    dto: CreatePackageDto | UpdatePackageDto,
    id: string | undefined,
    actorUserId?: string,
  ): Promise<Packages> {
    const payload = this.normalizePackagePayload(dto);

    if (payload.isFeatured === 1) {
      await this.clearFeaturedExcept(id);
    }

    if (id) {
      return this.update(id, payload, actorUserId);
    }

    return this.create(payload, actorUserId);
  }

  private normalizePackagePayload(
    dto: CreatePackageDto | UpdatePackageDto,
  ): DeepPartial<Packages> {
    const payload: DeepPartial<Packages> = {};

    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.description !== undefined) payload.description = dto.description;

    if (dto.coverImageUrl !== undefined) {
      const trimmed = dto.coverImageUrl?.trim();
      payload.coverImageUrl = trimmed ? trimmed : null;
    }

    if (dto.durationDays !== undefined) payload.durationDays = dto.durationDays;

    if (dto.active !== undefined) {
      payload.active = dto.active ? 1 : 0;
    }

    if (dto.isFeatured !== undefined) {
      payload.isFeatured = dto.isFeatured ? 1 : 0;
    }

    if (dto.discountPercent !== undefined) {
      payload.discountPercent = String(dto.discountPercent);
    }

    return payload;
  }

  private async clearFeaturedExcept(exceptId?: string): Promise<void> {
    const qb = this.packagesRepository
      .createQueryBuilder()
      .update(Packages)
      .set({ isFeatured: 0 });

    if (exceptId) {
      qb.where('id != :exceptId', { exceptId });
    }

    await qb.execute();
  }

  override async findAll(
    query: PackagesListQueryDto,
  ): Promise<PaginatedResult<Packages & { imageUrl: string | null }>> {
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
    const imageUrlByPackageId = await this.findPrimaryImageUrlsByPackageIds(
      data.map((pkg) => pkg.id),
    );

    return {
      data: data.map((pkg) => ({
        ...pkg,
        imageUrl: imageUrlByPackageId.get(pkg.id) ?? null,
      })),
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
    const descriptionAssets = await this.loadPackageDescriptionAssets(id);

    return { package: pkg, items, pricing, images, descriptionAssets };
  }

  async findPrimaryImageUrlsByPackageIds(
    packageIds: string[],
  ): Promise<Map<string, string>> {
    if (!packageIds.length) {
      return new Map();
    }

    const packages = await this.packagesRepository.find({
      where: { id: In(packageIds) },
    });
    const imageUrlByPackageId = new Map<string, string>();
    const fallbackPackageIds: string[] = [];

    for (const pkg of packages) {
      const cover = pkg.coverImageUrl?.trim();
      if (cover) {
        imageUrlByPackageId.set(pkg.id, cover);
      } else {
        fallbackPackageIds.push(pkg.id);
      }
    }

    if (!fallbackPackageIds.length) {
      return imageUrlByPackageId;
    }

    const rows = await this.packageImagesRepository.find({
      where: { packageId: In(fallbackPackageIds) },
      order: { sortOrder: 'ASC' },
    });
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

  private async loadPackageDescriptionAssets(
    packageId: string,
  ): Promise<PackageDescriptionAssetDto[]> {
    const rows = await this.packageDescriptionAssetsRepository.find({
      where: { packageId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return rows
      .filter((row) => !row.deletedAt)
      .map((row) => ({
        id: row.id,
        packageId: row.packageId,
        assetType: row.assetType,
        url: row.url,
        name: row.name ?? null,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null,
      }));
  }
}
