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

export type PackageDetail = {
  package: {
    id: string;
    name: string;
    description: string | null;
    discountPercent: string;
  };
  items: PackageItemEnriched[];
  pricing: PackagePricing;
};

export type PackagesBrowseQuery = {
  page?: number;
  limit?: number;
  search?: string;
};
