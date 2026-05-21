import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PackageItems, Packages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PackageItemPricingService } from '../packages/package-item-pricing.service';
import { CreatePackageItemDto } from './dto/create-package-item.dto';
import { PackageItemsListQueryDto } from './dto/package-items-list-query.dto';
import { UpdatePackageItemDto } from './dto/update-package-item.dto';

@Injectable()
export class PackageItemsService extends CrudService<PackageItems> {
  constructor(
    @InjectRepository(PackageItems)
    private readonly packageItemsRepository: Repository<PackageItems>,
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,
    private readonly pricingService: PackageItemPricingService,
  ) {
    super(packageItemsRepository);
  }

  override async findAll(
    query: PackageItemsListQueryDto,
  ): Promise<PaginatedResult<PackageItems>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.packageItemsRepository
      .createQueryBuilder('pi')
      .where('pi.deletedAt IS NULL');

    if (query.packageId) {
      qb.andWhere('pi.packageId = :packageId', { packageId: query.packageId });
    }

    qb.orderBy('pi.createdAt', 'ASC')
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

  async createItem(
    dto: CreatePackageItemDto,
    actorUserId?: string,
  ): Promise<PackageItems> {
    await this.assertPackageExists(dto.packageId);
    await this.pricingService.assertReferencedItemExists(dto.itemType, dto.itemId);
    await this.assertItemUnique(dto.packageId, dto.itemType, dto.itemId);

    return super.create(
      {
        packageId: dto.packageId,
        itemType: dto.itemType,
        itemId: dto.itemId,
      } as DeepPartial<PackageItems>,
      actorUserId,
    );
  }

  async updateItem(
    id: string,
    dto: UpdatePackageItemDto,
    actorUserId?: string,
  ): Promise<PackageItems> {
    const existing = await this.findOne(id);
    const itemType = dto.itemType ?? existing.itemType;
    const itemId = dto.itemId ?? existing.itemId;

    if (dto.itemType !== undefined || dto.itemId !== undefined) {
      await this.pricingService.assertReferencedItemExists(itemType, itemId);
      await this.assertItemUnique(existing.packageId, itemType, itemId, id);
    }

    const payload: DeepPartial<PackageItems> = {};
    if (dto.itemType !== undefined) payload.itemType = dto.itemType;
    if (dto.itemId !== undefined) payload.itemId = dto.itemId;

    return super.update(id, payload, actorUserId);
  }

  private async assertPackageExists(packageId: string): Promise<void> {
    const row = await this.packagesRepository.findOne({ where: { id: packageId } });
    if (!row || row.deletedAt) {
      throw new NotFoundException('Forfait introuvable.');
    }
  }

  private async assertItemUnique(
    packageId: string,
    itemType: PackageItems['itemType'],
    itemId: string,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.packageItemsRepository
      .createQueryBuilder('pi')
      .where('pi.packageId = :packageId', { packageId })
      .andWhere('pi.itemType = :itemType', { itemType })
      .andWhere('pi.itemId = :itemId', { itemId })
      .andWhere('pi.deletedAt IS NULL');

    if (excludeId) {
      qb.andWhere('pi.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    if (count > 0) {
      throw new ConflictException('Cet item est déjà présent dans le forfait.');
    }
  }
}
