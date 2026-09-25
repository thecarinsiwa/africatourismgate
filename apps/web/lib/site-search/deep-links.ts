import { buildSearchRoute } from '../search/route';

/** Deep-links publics pour les résultats de recherche globale. */
export const siteSearchDeepLinks = {
  hotel: (id: string) => `/hotels/${encodeURIComponent(id)}`,
  activity: (
    id: string,
    params?: {
      destination?: string;
      date?: string;
      participants?: string | number;
      scheduleId?: string;
    },
  ) => {
    const qs = new URLSearchParams();
    if (params?.destination) qs.set('destination', params.destination);
    if (params?.date) qs.set('date', params.date);
    if (params?.participants != null) {
      qs.set('participants', String(params.participants));
    }
    if (params?.scheduleId) qs.set('scheduleId', params.scheduleId);
    const query = qs.toString();
    return `/activities/${encodeURIComponent(id)}${query ? `?${query}` : ''}`;
  },
  packageItem: (id: string) => `/packages/${encodeURIComponent(id)}`,
  blogPost: (slug: string) => `/blog/${encodeURIComponent(slug)}`,
  helpArticle: (category: string, slug: string) =>
    `/support/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
  page: (href: string) => href,

  /** Listing hôtels pré-rempli avec une destination. */
  hotelsByDestination: (destination: string) => {
    const params = new URLSearchParams();
    params.set('destination', destination);
    return buildSearchRoute('hotels', params);
  },

  /** Listing activités/tours pré-rempli avec une destination. */
  activitiesByDestination: (destination: string) => {
    const params = new URLSearchParams();
    params.set('destination', destination);
    return buildSearchRoute('tours', params);
  },

  /** Listing vols pré-rempli avec un aéroport de départ (IATA ou nom). */
  flightsFrom: (from: string) => {
    const params = new URLSearchParams();
    params.set('from', from);
    return buildSearchRoute('flights', params);
  },

  /** Listing voitures pré-rempli avec un lieu de prise en charge. */
  carsByPickup: (pickupLocation: string) => {
    const params = new URLSearchParams();
    params.set('pickupLocation', pickupLocation);
    return buildSearchRoute('cars', params);
  },

  /** Listing croisières pré-rempli avec un port de départ. */
  cruisesFrom: (sailFrom: string) => {
    const params = new URLSearchParams();
    params.set('sailFrom', sailFrom);
    return buildSearchRoute('cruises', params);
  },
} as const;
