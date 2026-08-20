import type { AuditFields } from './index.js';

export type GapStatus = 'draft' | 'published';

export type GapPageSectionKey = 'about' | 'objectives' | 'unesco';

export type GapActivityIconKey = 'school' | 'tree' | 'art' | 'park' | 'community';

export type GapImpactStatColorKey = 'primary' | 'secondary';

export type GapMediaItemType = 'image' | 'video';

export interface GapSiteLink {
  label: string;
  url: string | null;
}

export interface GapSiteSettings extends AuditFields {
  id: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  /** Up to 10 partner / external links. */
  links: GapSiteLink[] | null;
  /** @deprecated Prefer links */
  unescoLabel: string | null;
  /** @deprecated Prefer links */
  unescoUrl: string | null;
  donateUrl: string | null;
  donateLabel: string | null;
  status: GapStatus;
  locale: string;
}

export interface GapPage extends AuditFields {
  id: string;
  sectionKey: GapPageSectionKey;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  /** Up to 10 image URLs; `coverImageUrl` is the cover (first). */
  coverImageUrls: string[] | null;
  status: GapStatus;
  publishedAt: string | null;
  locale: string;
}

export interface GapActivity extends AuditFields {
  id: string;
  title: string;
  description: string;
  iconKey: GapActivityIconKey;
  imageUrl: string | null;
  /** Up to 10 image URLs; `imageUrl` is the cover (first). */
  imageUrls: string[] | null;
  sortOrder: number;
  status: GapStatus;
  locale: string;
}

export interface GapImpactStat extends AuditFields {
  id: string;
  label: string;
  valueDisplay: string;
  description: string | null;
  colorKey: GapImpactStatColorKey;
  sortOrder: number;
  status: GapStatus;
  locale: string;
}

export interface GapMediaItem extends AuditFields {
  id: string;
  mediaType: GapMediaItemType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  status: GapStatus;
  locale: string;
}

export interface PublicGapSiteSettings {
  id: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  links: GapSiteLink[];
  /** @deprecated Prefer links */
  unescoLabel: string | null;
  /** @deprecated Prefer links */
  unescoUrl: string | null;
  donateUrl: string | null;
  donateLabel: string | null;
  locale: string;
}

export interface PublicGapPage {
  id: string;
  sectionKey: GapPageSectionKey;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  coverImageUrls: string[];
  publishedAt: string | null;
  locale: string;
}

export interface PublicGapActivity {
  id: string;
  title: string;
  description: string;
  iconKey: GapActivityIconKey;
  imageUrl: string | null;
  imageUrls: string[];
  sortOrder: number;
  locale: string;
}

export interface PublicGapImpactStat {
  id: string;
  label: string;
  valueDisplay: string;
  description: string | null;
  colorKey: GapImpactStatColorKey;
  sortOrder: number;
  locale: string;
}

export interface PublicGapMediaItem {
  id: string;
  mediaType: GapMediaItemType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  locale: string;
}

export interface PublicGapHome {
  settings: PublicGapSiteSettings | null;
  impactStats: PublicGapImpactStat[];
}

export interface CreateGapSiteSettingsRequest {
  title: string;
  subtitle: string;
  heroImageUrl: string;
  heroImageAlt: string;
  /** Up to 10 partner / external links. */
  links?: GapSiteLink[] | null;
  /** @deprecated Prefer links */
  unescoLabel?: string | null;
  /** @deprecated Prefer links */
  unescoUrl?: string | null;
  donateUrl?: string | null;
  donateLabel?: string | null;
  status?: GapStatus;
  locale?: string;
}

export type UpdateGapSiteSettingsRequest = Partial<CreateGapSiteSettingsRequest>;

export interface GapSiteSettingsListQuery {
  page?: number;
  limit?: number;
  locale?: string;
  status?: GapStatus;
}

export interface CreateGapPageRequest {
  sectionKey: GapPageSectionKey;
  title: string;
  excerpt?: string | null;
  content: string;
  /** Up to 10 image URLs; first becomes the cover. */
  coverImageUrls?: string[] | null;
  /** @deprecated Prefer coverImageUrls */
  coverImageUrl?: string | null;
  status?: GapStatus;
  publishedAt?: string | null;
  locale?: string;
}

export type UpdateGapPageRequest = Partial<CreateGapPageRequest>;

export interface GapPagesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sectionKey?: GapPageSectionKey;
  locale?: string;
  status?: GapStatus;
}

export interface CreateGapActivityRequest {
  title: string;
  description: string;
  iconKey: GapActivityIconKey;
  /** Up to 10 image URLs; first becomes the cover. */
  imageUrls?: string[] | null;
  /** @deprecated Prefer imageUrls */
  imageUrl?: string | null;
  sortOrder?: number;
  status?: GapStatus;
  locale?: string;
}

export type UpdateGapActivityRequest = Partial<CreateGapActivityRequest>;

export interface GapActivitiesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  status?: GapStatus;
}

export interface CreateGapImpactStatRequest {
  label: string;
  valueDisplay: string;
  description?: string | null;
  colorKey: GapImpactStatColorKey;
  sortOrder?: number;
  status?: GapStatus;
  locale?: string;
}

export type UpdateGapImpactStatRequest = Partial<CreateGapImpactStatRequest>;

export interface GapImpactStatsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  locale?: string;
  status?: GapStatus;
}

export interface CreateGapMediaItemRequest {
  mediaType: GapMediaItemType;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  externalUrl?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  sortOrder?: number;
  status?: GapStatus;
  locale?: string;
}

export type UpdateGapMediaItemRequest = Partial<CreateGapMediaItemRequest>;

export interface GapMediaItemsListQuery {
  page?: number;
  limit?: number;
  search?: string;
  mediaType?: GapMediaItemType;
  locale?: string;
  status?: GapStatus;
}

export interface PublicGapLocaleQuery {
  locale?: string;
}

export interface PublicGapPagesListQuery {
  page?: number;
  limit?: number;
  sectionKey?: GapPageSectionKey;
  locale?: string;
}

export interface PublicGapMediaListQuery {
  page?: number;
  limit?: number;
  mediaType?: GapMediaItemType;
  locale?: string;
}
