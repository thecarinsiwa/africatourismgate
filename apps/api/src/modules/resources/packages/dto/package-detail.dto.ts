import { PackageItems } from '../../../../entities/generated';
import { Packages } from '../../../../entities/generated';

export type PackageItemEnrichedDto = {
  id: string;
  packageId: string;
  itemType: PackageItems['itemType'];
  itemId: string;
  label: string;
  unitPriceCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type PackagePricingDto = {
  subtotalCents: number;
  discountPercent: number;
  discountAmountCents: number;
  totalCents: number;
  currency: string;
};

export type PackageGalleryImageDto = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

export type PackageDescriptionAssetDto = {
  id: string;
  packageId: string;
  assetType: 'image' | 'pdf' | 'word';
  url: string;
  name: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date | null;
};

export type PackageDetailDto = {
  package: Packages;
  items: PackageItemEnrichedDto[];
  pricing: PackagePricingDto;
  images: PackageGalleryImageDto[];
  descriptionAssets: PackageDescriptionAssetDto[];
};
