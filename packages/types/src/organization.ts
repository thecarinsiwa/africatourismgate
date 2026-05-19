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
  currency: string;
  status?: 'active' | 'suspended';
}

export type UpdateOrganizationRequest = Partial<CreateOrganizationRequest>;
