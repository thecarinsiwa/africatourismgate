import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActivityImages,
  Cabins,
  FlightImages,
  PackageItems,
  PropertyImages,
  ShipImages,
  VehicleImages,
} from '../../../entities/generated';
import {
  PackageSuggestedImageDto,
  PackageSuggestedImageGroupDto,
} from './dto/package-suggested-images.dto';
import { PackageItemPricingService } from './package-item-pricing.service';

type ProductImageRow = {
  url: string;
  caption: string | null;
  sortOrder: number;
};

@Injectable()
export class PackageImageSuggestionsService {
  constructor(
    @InjectRepository(PackageItems)
    private readonly packageItemsRepository: Repository<PackageItems>,
    @InjectRepository(PropertyImages)
    private readonly propertyImagesRepository: Repository<PropertyImages>,
    @InjectRepository(ActivityImages)
    private readonly activityImagesRepository: Repository<ActivityImages>,
    @InjectRepository(FlightImages)
    private readonly flightImagesRepository: Repository<FlightImages>,
    @InjectRepository(VehicleImages)
    private readonly vehicleImagesRepository: Repository<VehicleImages>,
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
    @InjectRepository(ShipImages)
    private readonly shipImagesRepository: Repository<ShipImages>,
    private readonly pricingService: PackageItemPricingService,
  ) {}

  async listSuggestedImages(packageId: string): Promise<PackageSuggestedImageGroupDto[]> {
    const rows = await this.packageItemsRepository.find({
      where: { packageId },
      order: { createdAt: 'ASC' },
    });
    const activeRows = rows.filter((row) => !row.deletedAt);

    const groups = await Promise.all(
      activeRows.map(async (row) => {
        const enriched = await this.pricingService.enrichItem(row);
        const images = await this.loadProductImages(row.itemType, row.itemId);
        return {
          packageItemId: row.id,
          itemType: row.itemType,
          itemId: row.itemId,
          label: enriched.label,
          images: images.map((image) => ({
            url: image.url,
            caption: image.caption,
            sortOrder: image.sortOrder,
          })),
        } satisfies PackageSuggestedImageGroupDto;
      }),
    );

    return groups;
  }

  private async loadProductImages(
    itemType: PackageItems['itemType'],
    itemId: string,
  ): Promise<ProductImageRow[]> {
    switch (itemType) {
      case 'property':
        return this.propertyImagesRepository.find({
          where: { propertyId: itemId },
          order: { sortOrder: 'ASC', createdAt: 'DESC' },
          take: 12,
        });
      case 'activity':
        return this.activityImagesRepository.find({
          where: { activityId: itemId },
          order: { sortOrder: 'ASC', createdAt: 'DESC' },
          take: 12,
        });
      case 'flight':
        return this.flightImagesRepository.find({
          where: { flightId: itemId },
          order: { sortOrder: 'ASC', createdAt: 'DESC' },
          take: 12,
        });
      case 'vehicle':
        return this.vehicleImagesRepository.find({
          where: { vehicleId: itemId },
          order: { sortOrder: 'ASC', createdAt: 'DESC' },
          take: 12,
        });
      case 'cruise':
        return this.loadCruiseImages(itemId);
      default:
        return [];
    }
  }

  private async loadCruiseImages(cabinId: string): Promise<ProductImageRow[]> {
    const cabin = await this.cabinsRepository.findOne({ where: { id: cabinId } });
    if (!cabin || cabin.deletedAt) {
      return [];
    }

    return this.shipImagesRepository.find({
      where: { shipId: cabin.shipId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      take: 12,
    });
  }
}

