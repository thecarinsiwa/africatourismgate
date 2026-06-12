import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageItems, Packages } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PackageDetailDto } from './dto/package-detail.dto';
import { PackageItemPricingService } from './package-item-pricing.service';

@Injectable()
export class PackagesService extends CrudService<Packages> {
  constructor(
    @InjectRepository(Packages)
    repository: Repository<Packages>,
    @InjectRepository(PackageItems)
    private readonly packageItemsRepository: Repository<PackageItems>,
    private readonly pricingService: PackageItemPricingService,
  ) {
    super(repository);
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

    return { package: pkg, items, pricing };
  }
}
