import type { ProductGalleryImage } from '../shared/product-images';

export type PackageItemType = 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity';

export type PackagePricing = {
  subtotalCents: number;
  discountPercent: number;
  discountAmountCents: number;
  totalCents: number;
  currency: string;
};

export type PackageListItem = {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number;
  itemCount: number;
  pricing: PackagePricing;
  imageUrl?: string | null;
};

export type PackageItemEnriched = {
  id: string;
  packageId: string;
  itemType: PackageItemType;
  itemId: string;
  label: string;
  unitPriceCents: number;
  currency: string;
};

export type PackageDescriptionAssetType = 'image' | 'pdf' | 'word';

export type PackageDescriptionAsset = {
  id: string;
  packageId: string;
  assetType: PackageDescriptionAssetType;
  url: string;
  name: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
};

export type PackageMapPoint = {
  label: string;
  latitude: number;
  longitude: number;
  itemType: PackageItemType;
  itemId: string;
  itemName: string;
};

export type PackageDetail = {
  package: {
    id: string;
    name: string;
    description: string | null;
    discountPercent: string;
    durationDays: number;
  };
  items: PackageItemEnriched[];
  pricing: PackagePricing;
  images?: ProductGalleryImage[];
  descriptionAssets?: PackageDescriptionAsset[];
  mapPoints?: PackageMapPoint[];
};

export type PackagesBrowseQuery = {
  page?: number;
  limit?: number;
  search?: string;
};
