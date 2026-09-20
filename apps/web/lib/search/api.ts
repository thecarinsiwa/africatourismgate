import type { SearchVertical } from './route';
import { createApiClient } from '@africatourismgate/api-client';

export type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
};

export type VerticalFetchResult = {
  items: SearchResultItem[];
  failed: boolean;
};

function client() {
  return createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api' });
}

function ok(items: SearchResultItem[]): VerticalFetchResult {
  return { items, failed: false };
}

function fail(): VerticalFetchResult {
  return { items: [], failed: true };
}

export async function fetchVerticalResults(
  vertical: SearchVertical,
  search?: string,
): Promise<VerticalFetchResult> {
  const api = client();
  const searchTerm = search || undefined;

  if (vertical === 'hotels') {
    try {
      const properties = await api.searchAccommodations({
        destination: searchTerm,
        limit: 20,
      });
      return ok(
        properties.data.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: p.destinationName,
          priceLabel: `${Math.round(p.minPriceCents / 100)} ${p.currency}`,
        })),
      );
    } catch {
      return fail();
    }
  }

  if (vertical === 'flights') {
    try {
      const flights = await api.listFlights({ limit: 20, search: searchTerm });
      return ok(
        flights.data.map((f) => ({
          id: f.id,
          title: f.flightNumber,
          subtitle: `${f.departureTime} - ${f.arrivalTime}`,
          priceLabel: 'From fares',
        })),
      );
    } catch {
      return fail();
    }
  }

  if (vertical === 'cars') {
    try {
      const vehicles = await api.listVehicles({ limit: 20, search: searchTerm });
      return ok(
        vehicles.data.map((v) => ({
          id: v.id,
          title: `Vehicle ${v.licensePlate ?? 'N/A'}`,
          subtitle: `Category ${v.categoryId}`,
          priceLabel: `${Math.round(v.dailyPriceCents / 100)} ${v.currency}/day`,
        })),
      );
    } catch {
      return fail();
    }
  }

  if (vertical === 'cruises') {
    try {
      const sailings = await api.listCruiseSailings({ limit: 20 });
      return ok(
        sailings.data.map((s) => ({
          id: s.id,
          title: `Cruise ${s.id.slice(0, 8)}`,
          subtitle: `Departure ${s.departureDate}`,
          priceLabel: 'On request',
        })),
      );
    } catch {
      return fail();
    }
  }

  // tours
  try {
    const activities = await api.listActivities({ limit: 20, search: searchTerm });
    return ok(
      activities.data.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.description ?? 'Guided activity',
        priceLabel: `${Math.round(a.priceCents / 100)} ${a.currency}`,
      })),
    );
  } catch {
    return fail();
  }
}
