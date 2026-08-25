import type {
  PaginatedResponse,
  PropertyDetail,
  PropertyDetailQuery,
  PropertyReviewsListQuery,
  PropertySearchQuery,
  PropertySearchResult,
  PublicDestination,
  PublicDestinationHighlight,
  Review,
  PublicBlogPostDetail,
  PublicBlogPostListItem,
  PublicBlogPostsListQuery,
  PublicAboutPage,
  PublicAboutResource,
  PublicAboutTimelineMilestone,
  PublicAboutTimelineMilestonesListQuery,
  PublicTeamMember,
  PublicAboutResourcesListQuery,
  PublicTeamMembersListQuery,
  PublicWhyUsContent,
  PublicWhyUsListQuery,
  PublicHappyCustomersContent,
  PublicHappyCustomersListQuery,
  PublicHeroSlide,
  PublicHeroSlidesListQuery,
  PublicFeaturedReviewsListQuery,
  PublicGapHome,
  AboutPageSectionKey,
} from '@africatourismgate/types';
import type {
  VehicleDetail,
  VehicleDetailQuery,
  VehicleSearchQuery,
  VehicleSearchResult,
} from '../cars/types';
import type {
  ActivityBrowseQuery,
  ActivityDetail,
  ActivityDetailQuery,
  ActivitySearchQuery,
  ActivitySearchResult,
} from '../activities/types';
import type {
  CruiseSailingDetail,
  CruiseSailingDetailQuery,
  CruiseSearchQuery,
  CruiseSearchResult,
} from '../cruises/types';
import type {
  PackageDetail,
  PackageListItem,
  PackagesBrowseQuery,
} from '../packages/types';
import type {
  FlightDetail,
  FlightDetailQuery,
  FlightSearchQuery,
  FlightSearchResult,
  PublicAirport,
} from '../flights/types';

export type {
  VehicleDetail,
  VehicleDetailAgency,
  VehicleDetailAvailabilitySlot,
  VehicleDetailCategory,
  VehicleDetailQuery,
  VehicleSearchQuery,
  VehicleSearchResult,
} from '../cars/types';

export type {
  FlightDetail,
  FlightDetailAirport,
  FlightDetailClass,
  FlightDetailQuery,
  FlightSearchQuery,
  FlightSearchResult,
  PublicAirport,
} from '../flights/types';

export type {
  ActivityBrowseQuery,
  ActivityDetail,
  ActivityDetailQuery,
  ActivityScheduleOffer,
  ActivitySearchQuery,
  ActivitySearchResult,
} from '../activities/types';

export type {
  CruiseCabinOffer,
  CruiseItineraryPort,
  CruiseSailingDetail,
  CruiseSailingDetailQuery,
  CruiseSearchQuery,
  CruiseSearchResult,
} from '../cruises/types';

export type {
  PackageDetail,
  PackageItemEnriched,
  PackageListItem,
  PackagePricing,
  PackagesBrowseQuery,
} from '../packages/types';

export type { PublicDestinationHighlight } from '@africatourismgate/types';
import { getWebApiUrl } from './get-api-url';

const apiUrl = getWebApiUrl();

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

function buildSearchQuery(params: PropertySearchQuery): string {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  if (params.destinationId) qs.set('destinationId', params.destinationId);
  if (params.checkIn) qs.set('checkIn', params.checkIn);
  if (params.checkOut) qs.set('checkOut', params.checkOut);
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  if (params.propertyType) qs.set('propertyType', params.propertyType);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function listPublicDestinations(): Promise<PublicDestination[]> {
  return fetchPublic<PublicDestination[]>('/public/destinations');
}

export async function listFeaturedDestinations(
  limit = 4,
): Promise<PublicDestinationHighlight[]> {
  const qs = new URLSearchParams({ limit: String(limit) }).toString();
  return fetchPublic<PublicDestinationHighlight[]>(`/public/destinations/featured?${qs}`);
}

export async function listVehiclePickupLocations(): Promise<PublicDestination[]> {
  return fetchPublic<PublicDestination[]>('/public/vehicles/pickup-locations');
}

export async function listActivityDestinations(): Promise<PublicDestination[]> {
  return fetchPublic<PublicDestination[]>('/public/activities/destinations');
}

export async function listPublicAirports(): Promise<PublicAirport[]> {
  return fetchPublic<PublicAirport[]>('/public/airports');
}

export async function searchAccommodations(
  params: PropertySearchQuery,
): Promise<PaginatedResponse<PropertySearchResult>> {
  return fetchPublic<PaginatedResponse<PropertySearchResult>>(
    `/public/accommodations/search${buildSearchQuery(params)}`,
  );
}

function buildDetailQuery(params: PropertyDetailQuery): string {
  const qs = new URLSearchParams();
  if (params.checkIn) qs.set('checkIn', params.checkIn);
  if (params.checkOut) qs.set('checkOut', params.checkOut);
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  if (params.month) qs.set('month', params.month);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getAccommodationDetail(
  id: string,
  params: PropertyDetailQuery = {},
): Promise<PropertyDetail> {
  return fetchPublic<PropertyDetail>(
    `/public/accommodations/${encodeURIComponent(id)}${buildDetailQuery(params)}`,
  );
}

function buildReviewsQuery(params: PropertyReviewsListQuery): string {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getPropertyReviews(
  propertyId: string,
  params: PropertyReviewsListQuery = {},
): Promise<PaginatedResponse<Review>> {
  return fetchPublic<PaginatedResponse<Review>>(
    `/public/accommodations/${encodeURIComponent(propertyId)}/reviews${buildReviewsQuery(params)}`,
  );
}

function buildFlightSearchQuery(params: FlightSearchQuery): string {
  const qs = new URLSearchParams();
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  if (params.departureDate) qs.set('departureDate', params.departureDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.passengers !== undefined) qs.set('passengers', String(params.passengers));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function searchFlights(
  params: FlightSearchQuery,
): Promise<PaginatedResponse<FlightSearchResult>> {
  return fetchPublic<PaginatedResponse<FlightSearchResult>>(
    `/public/flights/search${buildFlightSearchQuery(params)}`,
  );
}

function buildFlightDetailQuery(params: FlightDetailQuery): string {
  const qs = new URLSearchParams();
  qs.set('departureDate', params.departureDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.passengers !== undefined) qs.set('passengers', String(params.passengers));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getFlightDetail(
  id: string,
  params: FlightDetailQuery,
): Promise<FlightDetail> {
  return fetchPublic<FlightDetail>(
    `/public/flights/${encodeURIComponent(id)}${buildFlightDetailQuery(params)}`,
  );
}

function buildVehicleSearchQuery(params: VehicleSearchQuery): string {
  const qs = new URLSearchParams();
  if (params.pickupLocation) qs.set('pickupLocation', params.pickupLocation);
  if (params.pickupDate) qs.set('pickupDate', params.pickupDate);
  if (params.returnDate) qs.set('returnDate', params.returnDate);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function searchVehicles(
  params: VehicleSearchQuery,
): Promise<PaginatedResponse<VehicleSearchResult>> {
  return fetchPublic<PaginatedResponse<VehicleSearchResult>>(
    `/public/vehicles/search${buildVehicleSearchQuery(params)}`,
  );
}

function buildVehicleDetailQuery(params: VehicleDetailQuery): string {
  const qs = new URLSearchParams();
  qs.set('pickupDate', params.pickupDate);
  qs.set('returnDate', params.returnDate);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getVehicleDetail(
  id: string,
  params: VehicleDetailQuery,
): Promise<VehicleDetail> {
  return fetchPublic<VehicleDetail>(
    `/public/vehicles/${encodeURIComponent(id)}${buildVehicleDetailQuery(params)}`,
  );
}

function buildCruiseSearchQuery(params: CruiseSearchQuery): string {
  const qs = new URLSearchParams();
  if (params.sailFrom) qs.set('sailFrom', params.sailFrom);
  if (params.sailTo) qs.set('sailTo', params.sailTo);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function searchCruises(
  params: CruiseSearchQuery,
): Promise<PaginatedResponse<CruiseSearchResult>> {
  return fetchPublic<PaginatedResponse<CruiseSearchResult>>(
    `/public/cruises/search${buildCruiseSearchQuery(params)}`,
  );
}

function buildCruiseSailingDetailQuery(params: CruiseSailingDetailQuery): string {
  const qs = new URLSearchParams();
  if (params.guests !== undefined) qs.set('guests', String(params.guests));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getCruiseSailingDetail(
  id: string,
  params: CruiseSailingDetailQuery = {},
): Promise<CruiseSailingDetail> {
  return fetchPublic<CruiseSailingDetail>(
    `/public/cruises/sailings/${encodeURIComponent(id)}${buildCruiseSailingDetailQuery(params)}`,
  );
}

function buildActivitySearchQuery(params: ActivitySearchQuery): string {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  qs.set('date', params.date);
  if (params.participants !== undefined) qs.set('participants', String(params.participants));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function browseActivities(
  params: ActivityBrowseQuery,
): Promise<PaginatedResponse<ActivitySearchResult>> {
  const qs = new URLSearchParams();
  if (params.destination) qs.set('destination', params.destination);
  if (params.participants !== undefined) qs.set('participants', String(params.participants));
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return fetchPublic<PaginatedResponse<ActivitySearchResult>>(
    `/public/activities/browse${query ? `?${query}` : ''}`,
  );
}

export async function searchActivities(
  params: ActivitySearchQuery,
): Promise<PaginatedResponse<ActivitySearchResult>> {
  return fetchPublic<PaginatedResponse<ActivitySearchResult>>(
    `/public/activities/search${buildActivitySearchQuery(params)}`,
  );
}

function buildActivityDetailQuery(params: ActivityDetailQuery): string {
  const qs = new URLSearchParams();
  qs.set('date', params.date);
  if (params.participants !== undefined) qs.set('participants', String(params.participants));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getActivityDetail(
  id: string,
  params: ActivityDetailQuery,
): Promise<ActivityDetail> {
  return fetchPublic<ActivityDetail>(
    `/public/activities/${encodeURIComponent(id)}${buildActivityDetailQuery(params)}`,
  );
}

function buildPackagesBrowseQuery(params: PackagesBrowseQuery): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function browsePackages(
  params: PackagesBrowseQuery = {},
): Promise<PaginatedResponse<PackageListItem>> {
  return fetchPublic<PaginatedResponse<PackageListItem>>(
    `/public/packages${buildPackagesBrowseQuery(params)}`,
  );
}

export async function getFeaturedPackage(): Promise<PackageListItem | null> {
  try {
    return await fetchPublic<PackageListItem | null>('/public/packages/featured');
  } catch {
    return null;
  }
}

export async function getPackageDetail(id: string): Promise<PackageDetail> {
  return fetchPublic<PackageDetail>(`/public/packages/${encodeURIComponent(id)}`);
}

export type PackageResolvedLineQuery = {
  startDate: string;
  endDate: string;
  travelers: number;
};

export type PackageResolvedLine = {
  lineType: 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity';
  itemId: string;
  scheduleId?: string;
  date?: string;
  participants?: number;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  flightClassId?: string;
  departureDate?: string;
  passengers?: number;
  availabilitySlotId?: string;
  pickupDate?: string;
  returnDate?: string;
  sailingId?: string;
  cabinAvailabilityId?: string;
};

function buildPackageResolveLinesQuery(params: PackageResolvedLineQuery): string {
  const qs = new URLSearchParams();
  qs.set('startDate', params.startDate);
  qs.set('endDate', params.endDate);
  qs.set('travelers', String(params.travelers));
  return `?${qs.toString()}`;
}

export async function getPackageResolvedLines(
  packageId: string,
  params: PackageResolvedLineQuery,
): Promise<PackageResolvedLine[]> {
  return fetchPublic<PackageResolvedLine[]>(
    `/public/packages/${encodeURIComponent(packageId)}/resolve-lines${buildPackageResolveLinesQuery(params)}`,
  );
}

export type { PublicBlogPostDetail, PublicBlogPostListItem, PublicBlogPostsListQuery };
import {
  findBlogSiblings,
  localizeBlogPosts,
  pickBlogPostForLocale,
} from '../blog/locale';
import { applyBlogDetailLocaleFallback, resolveBlogApiSlug } from '../blog/fallback-posts';

function buildBlogQuery(params: PublicBlogPostsListQuery): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.locale) qs.set('locale', params.locale);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function browseBlogPosts(
  params: PublicBlogPostsListQuery = {},
): Promise<PaginatedResponse<PublicBlogPostListItem>> {
  return fetchPublic<PaginatedResponse<PublicBlogPostListItem>>(
    `/public/blog${buildBlogQuery(params)}`,
  );
}

/** One article per translation group, in the requested locale. */
export async function browseBlogPostsForLocale(
  locale: string,
  params: Omit<PublicBlogPostsListQuery, 'locale'> = {},
): Promise<{
  response: PaginatedResponse<PublicBlogPostListItem>;
  usedLocaleFallback: boolean;
}> {
  try {
    const limit = params.limit ?? 50;
    const all = await browseBlogPosts({ ...params, limit: Math.max(limit, 100) });
    const { data, usedLocaleFallback } = localizeBlogPosts(all.data, locale);
    const page = params.page ?? 1;
    const offset = (page - 1) * limit;
    const pageData = data.slice(offset, offset + limit);

    return {
      response: {
        data: pageData,
        meta: {
          total: data.length,
          page,
          limit,
          totalPages: Math.ceil(data.length / limit) || 1,
        },
      },
      usedLocaleFallback,
    };
  } catch {
    return {
      response: {
        data: [],
        meta: { total: 0, page: 1, limit: params.limit ?? 50, totalPages: 0 },
      },
      usedLocaleFallback: false,
    };
  }
}

export async function getBlogPostBySlug(
  slug: string,
  locale?: string,
): Promise<PublicBlogPostDetail> {
  const qs = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return fetchPublic<PublicBlogPostDetail>(
    `/public/blog/${encodeURIComponent(slug)}${qs}`,
  );
}

/** Resolve translated article for `locale` (same logical post, localized content). */
export async function getBlogPostBySlugForLocale(
  slug: string,
  locale?: string,
): Promise<PublicBlogPostDetail> {
  const apiSlug = resolveBlogApiSlug(slug) ?? slug;
  const anchor = await getBlogPostBySlug(apiSlug);
  if (!locale) {
    return anchor;
  }

  const all = await browseBlogPosts({ limit: 100 });
  const siblings = findBlogSiblings(all.data, anchor);
  const match = pickBlogPostForLocale(siblings, locale);

  let detail = anchor;
  if (match && match.locale === locale && match.slug !== apiSlug) {
    detail = await getBlogPostBySlug(match.slug);
  }

  return applyBlogDetailLocaleFallback(detail, locale);
}

export type { PublicAboutPage, PublicAboutResource, PublicTeamMember };

export async function getAboutPageBySectionKey(
  sectionKey: AboutPageSectionKey,
  locale?: string,
): Promise<PublicAboutPage> {
  const qs = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return fetchPublic<PublicAboutPage>(
    `/public/about-pages/${encodeURIComponent(sectionKey)}${qs}`,
  );
}

export async function getAboutPageBySectionKeyForLocale(
  sectionKey: AboutPageSectionKey,
  locale?: string,
): Promise<PublicAboutPage> {
  if (!locale) {
    return getAboutPageBySectionKey(sectionKey);
  }

  try {
    return await getAboutPageBySectionKey(sectionKey, locale);
  } catch {
    return getAboutPageBySectionKey(sectionKey);
  }
}

function buildTeamMembersQuery(params: PublicTeamMembersListQuery): string {
  const qs = new URLSearchParams();
  if (params.locale) qs.set('locale', params.locale);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function browseTeamMembers(
  params: PublicTeamMembersListQuery = {},
): Promise<PaginatedResponse<PublicTeamMember>> {
  return fetchPublic<PaginatedResponse<PublicTeamMember>>(
    `/public/team-members${buildTeamMembersQuery(params)}`,
  );
}

export async function browseTeamMembersForLocale(
  locale: string,
  params: Omit<PublicTeamMembersListQuery, 'locale'> = {},
): Promise<{
  response: PaginatedResponse<PublicTeamMember>;
  usedLocaleFallback: boolean;
}> {
  try {
    const localized = await browseTeamMembers({ ...params, locale });
    if (localized.data.length > 0) {
      return { response: localized, usedLocaleFallback: false };
    }
  } catch {
    /* try without locale below */
  }

  const all = await browseTeamMembers(params);
  return {
    response: all,
    usedLocaleFallback: all.data.length > 0,
  };
}

function buildAboutResourcesQuery(params: PublicAboutResourcesListQuery): string {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.locale) qs.set('locale', params.locale);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function browseAboutResources(
  params: PublicAboutResourcesListQuery = {},
): Promise<PaginatedResponse<PublicAboutResource>> {
  return fetchPublic<PaginatedResponse<PublicAboutResource>>(
    `/public/about-resources${buildAboutResourcesQuery(params)}`,
  );
}

export async function browseAboutResourcesForLocale(
  locale: string,
  params: Omit<PublicAboutResourcesListQuery, 'locale'> = {},
): Promise<{
  response: PaginatedResponse<PublicAboutResource>;
  usedLocaleFallback: boolean;
}> {
  try {
    const localized = await browseAboutResources({ ...params, locale });
    if (localized.data.length > 0) {
      return { response: localized, usedLocaleFallback: false };
    }
  } catch {
    /* try without locale below */
  }

  const all = await browseAboutResources(params);
  return {
    response: all,
    usedLocaleFallback: all.data.length > 0,
  };
}

function buildAboutTimelineMilestonesQuery(
  params: PublicAboutTimelineMilestonesListQuery,
): string {
  const qs = new URLSearchParams();
  if (params.locale) qs.set('locale', params.locale);
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function browseAboutTimelineMilestones(
  params: PublicAboutTimelineMilestonesListQuery = {},
): Promise<PaginatedResponse<PublicAboutTimelineMilestone>> {
  return fetchPublic<PaginatedResponse<PublicAboutTimelineMilestone>>(
    `/public/about-timeline-milestones${buildAboutTimelineMilestonesQuery(params)}`,
  );
}

export async function browseAboutTimelineMilestonesForLocale(
  locale: string,
  params: Omit<PublicAboutTimelineMilestonesListQuery, 'locale'> = {},
): Promise<{
  response: PaginatedResponse<PublicAboutTimelineMilestone>;
  usedLocaleFallback: boolean;
}> {
  try {
    const localized = await browseAboutTimelineMilestones({ ...params, locale });
    if (localized.data.length > 0) {
      return { response: localized, usedLocaleFallback: false };
    }
  } catch {
    /* try without locale below */
  }

  const all = await browseAboutTimelineMilestones(params);
  return {
    response: all,
    usedLocaleFallback: all.data.length > 0,
  };
}

function buildWhyUsQuery(params: PublicWhyUsListQuery): string {
  const qs = new URLSearchParams();
  if (params.locale) qs.set('locale', params.locale);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getPublicWhyUs(
  params: PublicWhyUsListQuery = {},
): Promise<PublicWhyUsContent> {
  return fetchPublic<PublicWhyUsContent>(`/public/why-us${buildWhyUsQuery(params)}`);
}

export async function getPublicWhyUsForLocale(
  locale: string,
): Promise<{ content: PublicWhyUsContent; usedLocaleFallback: boolean }> {
  try {
    const localized = await getPublicWhyUs({ locale });
    const sectionOk = !localized.section || localized.section.locale === locale;
    const itemsOk =
      localized.items.length === 0 || localized.items.every((item) => item.locale === locale);

    if (sectionOk && itemsOk && (localized.section || localized.items.length > 0)) {
      return { content: localized, usedLocaleFallback: false };
    }
  } catch {
    /* use translation fallbacks below */
  }

  return {
    content: { section: null, items: [] },
    usedLocaleFallback: true,
  };
}

function buildHappyCustomersQuery(params: PublicHappyCustomersListQuery): string {
  const qs = new URLSearchParams();
  if (params.locale) qs.set('locale', params.locale);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getPublicHappyCustomers(
  params: PublicHappyCustomersListQuery = {},
): Promise<PublicHappyCustomersContent> {
  return fetchPublic<PublicHappyCustomersContent>(
    `/public/happy-customers${buildHappyCustomersQuery(params)}`,
  );
}

function happyCustomersContentMatchesLocale(
  content: PublicHappyCustomersContent,
  locale: string,
): boolean {
  if (content.section?.locale === locale) return true;
  if (content.stats.length > 0 && content.stats.every((stat) => stat.locale === locale)) {
    return true;
  }
  return false;
}

export async function getPublicHappyCustomersForLocale(
  locale: string,
): Promise<{ content: PublicHappyCustomersContent; usedLocaleFallback: boolean }> {
  try {
    const localized = await getPublicHappyCustomers({ locale });
    if (happyCustomersContentMatchesLocale(localized, locale)) {
      return { content: localized, usedLocaleFallback: false };
    }
    if (localized.section || localized.stats.length > 0) {
      return { content: localized, usedLocaleFallback: true };
    }
  } catch {
    /* try without locale below */
  }

  const fallback = await getPublicHappyCustomers();
  return {
    content: fallback,
    usedLocaleFallback: Boolean(fallback.section || fallback.stats.length > 0),
  };
}

function buildHeroSlidesQuery(params: PublicHeroSlidesListQuery): string {
  const qs = new URLSearchParams();
  if (params.locale) qs.set('locale', params.locale);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function getPublicHeroSlides(
  params: PublicHeroSlidesListQuery = {},
): Promise<PublicHeroSlide[]> {
  return fetchPublic<PublicHeroSlide[]>(`/public/hero-slides${buildHeroSlidesQuery(params)}`);
}

export async function getPublicHeroSlidesForLocale(
  locale: string,
): Promise<{ slides: PublicHeroSlide[]; usedLocaleFallback: boolean }> {
  try {
    const localized = await getPublicHeroSlides({ locale });
    if (localized.length > 0) {
      return { slides: localized, usedLocaleFallback: false };
    }
  } catch {
    /* try without locale below */
  }

  const fallback = await getPublicHeroSlides();
  return {
    slides: fallback,
    usedLocaleFallback: fallback.length > 0,
  };
}

export async function getPublicFeaturedReviews(
  params: PublicFeaturedReviewsListQuery = {},
): Promise<Review[]> {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return fetchPublic<Review[]>(`/public/reviews/featured${query ? `?${query}` : ''}`);
}

export async function getPublicGapHome(locale?: string): Promise<PublicGapHome> {
  const qs = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  return fetchPublic<PublicGapHome>(`/public/gap${qs}`);
}

export async function getPublicGapHomeForLocale(locale?: string): Promise<PublicGapHome> {
  if (!locale) {
    return getPublicGapHome();
  }
  try {
    return await getPublicGapHome(locale);
  } catch {
    return getPublicGapHome();
  }
}
