import type { AuditFields } from './index.js';

export type HeroSlideStatus = 'draft' | 'published';

export interface HeroSlide extends AuditFields {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string | null;
  sortOrder: number;
  status: HeroSlideStatus;
  locale: string;
}

export interface PublicHeroSlide {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string | null;
  sortOrder: number;
  locale: string;
}

export interface CreateHeroSlideRequest {
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href?: string | null;
  sortOrder?: number;
  status?: HeroSlideStatus;
  locale?: string;
}

export type UpdateHeroSlideRequest = Partial<CreateHeroSlideRequest>;

export interface HeroSlidesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  status?: HeroSlideStatus;
}

export interface PublicHeroSlidesListQuery {
  locale?: string;
}
