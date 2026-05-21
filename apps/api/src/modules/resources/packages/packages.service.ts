import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PackageItems, Packages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackageDetailDto } from './dto/package-detail.dto';
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
    private readonly pricingService: PackageItemPricingService,
  ) {
    super(packagesRepository);
  }

  override async findAll(
    query: PackagesListQueryDto,
  ): Promise<PaginatedResult<Packages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.packagesRepository
      .createQueryBuilder('pkg')
      .where('pkg.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub.where('LOWER(pkg.name) LIKE :pattern', { pattern });
        }),
      );
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

  async getPackageDetail(id: string): Promise<PackageDetailDto> {
    const pkg = await this.packagesRepository.findOne({ where: { id } });
    if (!pkg || pkg.deletedAt) {
      throw new NotFoundException('Forfait introuvable.');
    }

    const rows = await this.packageItemsRepository
      .createQueryBuilder('pi')
      .where('pi.packageId = :packageId', { packageId: id })
      .andWhere('pi.deletedAt IS NULL')
      .orderBy('pi.createdAt', 'ASC')
      .getMany();

    const items = await Promise.all(rows.map((row) => this.pricingService.enrichItem(row)));
    const discountPercent = Number(pkg.discountPercent);
    const pricing = this.pricingService.computePricing(items, discountPercent);

    return { package: pkg, items, pricing };
  }

  createPackage(dto: CreatePackageDto, actorUserId?: string): Promise<Packages> {
    return super.create(this.toEntityPayload(dto), actorUserId);
  }

  updatePackage(
    id: string,
    dto: UpdatePackageDto,
    actorUserId?: string,
  ): Promise<Packages> {
    return super.update(id, this.toEntityPayload(dto), actorUserId);
  }

  private toEntityPayload(
    dto: CreatePackageDto | UpdatePackageDto,
  ): DeepPartial<Packages> {
    const payload: DeepPartial<Packages> = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.discountPercent !== undefined) {
      payload.discountPercent = dto.discountPercent.toFixed(2);
    }
    if (dto.active !== undefined) payload.active = dto.active ? 1 : 0;
    return payload;
  }
}
