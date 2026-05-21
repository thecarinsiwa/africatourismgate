export type PackageItemType = 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity';

export interface Package {
  id: string;
  name: string;
  description: string | null;
  discountPercent: string;
  active: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePackageRequest {
  name: string;
  description?: string;
  discountPercent: number;
  active: boolean;
}

export type UpdatePackageRequest = Partial<CreatePackageRequest>;

export interface PackagesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface PackageItem {
  id: string;
  packageId: string;
  itemType: PackageItemType;
  itemId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePackageItemRequest {
  packageId: string;
  itemType: PackageItemType;
  itemId: string;
}

export type UpdatePackageItemRequest = Partial<
  Omit<CreatePackageItemRequest, 'packageId'>
>;

export interface PackageItemsListQuery {
  page?: number;
  limit?: number;
  packageId?: string;
}

export interface PackageItemEnriched {
  id: string;
  packageId: string;
  itemType: PackageItemType;
  itemId: string;
  label: string;
  unitPriceCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PackagePricing {
  subtotalCents: number;
  discountPercent: number;
  discountAmountCents: number;
  totalCents: number;
  currency: string;
}

export interface PackageDetail {
  package: Package;
  items: PackageItemEnriched[];
  pricing: PackagePricing;
}
