import type { AuditFields } from './index.js';

export type DonationStatus = 'draft' | 'published';

export type DonationSurface = 'web' | 'gap';

export interface Donation extends AuditFields {
  id: string;
  title: string;
  description: string | null;
  contextNote: string | null;
  buttonLabel: string;
  url: string;
  locale: string;
  showOnWeb: boolean;
  showOnGap: boolean;
  isNavbarFeatured: boolean;
  status: DonationStatus;
  sortOrder: number;
}

export interface PublicDonation {
  id: string;
  title: string;
  description: string | null;
  contextNote: string | null;
  buttonLabel: string;
  url: string;
  locale: string;
  isNavbarFeatured: boolean;
  sortOrder: number;
}

export interface PublicDonationsPayload {
  navbarFeatured: PublicDonation | null;
  items: PublicDonation[];
}

export interface CreateDonationRequest {
  title: string;
  description?: string | null;
  contextNote?: string | null;
  buttonLabel: string;
  url: string;
  locale?: string;
  showOnWeb?: boolean;
  showOnGap?: boolean;
  isNavbarFeatured?: boolean;
  status?: DonationStatus;
  sortOrder?: number;
}

export type UpdateDonationRequest = Partial<CreateDonationRequest>;

export interface DonationsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  status?: DonationStatus;
}

export interface PublicDonationsQuery {
  locale?: string;
  surface?: DonationSurface;
}
