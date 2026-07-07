import { createApiClient } from '@africatourismgate/api-client';
import type { Destination, Property, PropertyImage, Room } from '@africatourismgate/types';
import type { HotelAmenity, HotelDetails, HotelListing, HotelType } from './types';

const FALLBACK_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Table_Mountain_DanieVDM.jpg/1280px-Table_Mountain_DanieVDM.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Zanzibar_beach.jpg/1280px-Zanzibar_beach.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Koutoubia_Mosque%2C_Marrakech.jpg/1280px-Koutoubia_Mosque%2C_Marrakech.jpg',
];

function mapPropertyType(value: Property['propertyType']): HotelType {
  if (value === 'resort') return 'resort';
  if (value === 'hotel') return 'hotel';
  if (value === 'villa') return 'lodge';
  if (value === 'apartment') return 'hotel';
  if (value === 'hostel') return 'hotel';
  return 'riad';
}

function guessAmenities(type: HotelType): HotelAmenity[] {
  if (type === 'resort') return ['wifi', 'pool', 'breakfast', 'spa'];
  if (type === 'lodge') return ['wifi', 'breakfast', 'parking'];
  if (type === 'riad') return ['wifi', 'breakfast', 'spa'];
  return ['wifi', 'breakfast', 'parking'];
}

function parseStars(starRating: string | null): number {
  const n = Number(starRating ?? '4');
  if (Number.isNaN(n)) return 4;
  return Math.min(5, Math.max(2, Math.round(n)));
}

function parseAddress(addressLine: string | null): { location: string; country: string } {
  if (!addressLine) return { location: 'City Center', country: 'Africa' };
  const [first, second] = addressLine.split(',').map((p) => p.trim());
  return { location: first || 'City Center', country: second || 'Africa' };
}

function mapListing(
  property: Property,
  destinationName: string | undefined,
  imageUrl: string | undefined,
  index: number,
): HotelListing {
  const type = mapPropertyType(property.propertyType);
  const stars = parseStars(property.starRating);
  const rating = Number((7.8 + (stars - 2) * 0.45 + (index % 5) * 0.12).toFixed(1));
  const reviews = 120 + index * 17;
  const roomPrice = 95 + stars * 25 + (index % 4) * 15;
  const address = parseAddress(property.addressLine);

  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    location: destinationName ?? address.location,
    country: address.country,
    image: imageUrl ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    stars,
    rating,
    reviews,
    price: roomPrice,
    type,
    amenities: guessAmenities(type),
    featured: stars >= 4,
    destinationName,
  };
}

import { getWebApiUrl } from '../api/get-api-url';

function apiClient() {
  return createApiClient({
    baseUrl: getWebApiUrl(),
    accessToken: null,
  });
}

export async function fetchHotelListings(search?: string): Promise<HotelListing[]> {
  const client = apiClient();
  let propertiesRes;
  let destinationsRes;
  let imagesRes;
  try {
    [propertiesRes, destinationsRes, imagesRes] = await Promise.all([
      client.listProperties({ limit: 100, search: search?.trim() || undefined }),
      client.listDestinations({ limit: 200 }),
      client.listPropertyImages({ limit: 300 }),
    ]);
  } catch {
    return [];
  }

  const destinationsById = new Map<string, Destination>();
  for (const d of destinationsRes.data) destinationsById.set(d.id, d);

  const imagesByProperty = new Map<string, PropertyImage[]>();
  for (const img of imagesRes.data) {
    const list = imagesByProperty.get(img.propertyId) ?? [];
    list.push(img);
    imagesByProperty.set(img.propertyId, list);
  }

  const mapped = propertiesRes.data.map((property, index) => {
    const destination = destinationsById.get(property.destinationId);
    const images = imagesByProperty.get(property.id) ?? [];
    images.sort((a, b) => a.sortOrder - b.sortOrder);
    return mapListing(property, destination?.name, images[0]?.url, index);
  });

  if (!search?.trim()) {
    return mapped.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }

  const q = search.trim().toLowerCase();
  const filtered = mapped.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q),
  );

  return filtered.length > 0 ? filtered : mapped;
}

export async function fetchHotelBySlug(slug: string): Promise<HotelDetails | null> {
  const client = apiClient();
  let propertiesRes;
  try {
    propertiesRes = await client.listProperties({ limit: 100, search: slug });
  } catch {
    return null;
  }
  const property = propertiesRes.data.find((p) => p.slug === slug);
  if (!property) return null;

  const [destination, imagesRes, roomsRes] = await Promise.all([
    client.getDestination(property.destinationId).catch(() => null),
    client.listPropertyImages({ propertyId: property.id, limit: 40 }),
    client.listRooms({ propertyId: property.id, limit: 20 }),
  ]);

  const images = imagesRes.data.sort((a, b) => a.sortOrder - b.sortOrder);
  const listing = mapListing(property, destination?.name, images[0]?.url, 0);

  const rooms = roomsRes.data.map((room: Room) => ({
    id: room.id,
    name: room.name,
    roomType: room.roomType ?? 'Standard',
    maxGuests: room.maxGuests,
    bedConfig: room.bedConfig ?? 'N/A',
    price: Math.round(room.basePriceCents / 100),
    currency: room.currency,
  }));

  return {
    ...listing,
    description: property.description ?? undefined,
    addressLine: property.addressLine ?? undefined,
    gallery: images.map((i) => i.url),
    rooms,
  };
}