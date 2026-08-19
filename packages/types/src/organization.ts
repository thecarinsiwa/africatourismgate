export type OrganizationStatus = 'active' | 'suspended' | 'deleted';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  legalForm: string | null;
  rccm: string | null;
  idNat: string | null;
  nif: string | null;
  cnss: string | null;
  currency: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  legalForm?: string;
  rccm?: string;
  idNat?: string;
  nif?: string;
  cnss?: string;
  currency: string;
  status?: 'active' | 'suspended';
}

export type UpdateOrganizationRequest = Partial<
  Omit<
    CreateOrganizationRequest,
    'description' | 'website' | 'contactEmail' | 'contactPhone' | 'legalForm' | 'rccm' | 'idNat' | 'nif' | 'cnss'
  >
> & {
  description?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  legalForm?: string | null;
  rccm?: string | null;
  idNat?: string | null;
  nif?: string | null;
  cnss?: string | null;
};

export interface OrganizationsListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface OrganizationListItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  legalForm: string | null;
  currency: string;
  status: OrganizationStatus;
  createdAt: string;
  userCount: number;
  employeeCount: number;
  /** Catalog items linked to the org (currently tour guides). */
  productCount: number;
}
