import type { SearchVertical } from './route';
import { createApiClient } from '@africatourismgate/api-client';

type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
};

function client() {
  return createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api' });
}

export async function fetchVerticalResults(vertical: SearchVertical, search?: string): Promise<SearchResultItem[]> {
  const api = client();

  if (vertical === 'flights') {
    try {
      const flights = await api.listFlights({ limit: 20, search: search || undefined });
      return flights.data.map((f) => ({ id: f.id, title: f.flightNumber, subtitle: `${f.departureTime} - ${f.arrivalTime}`, priceLabel: 'From fares' }));
    } catch {
      return [];
    }
  }

  if (vertical === 'cars') {
    try {
      const vehicles = await api.listVehicles({ limit: 20, search: search || undefined });
      return vehicles.data.map((v) => ({ id: v.id, title: `Vehicle ${v.licensePlate ?? 'N/A'}`, subtitle: `Category ${v.categoryId}`, priceLabel: `${Math.round(v.dailyPriceCents / 100)} ${v.currency}/day` }));
    } catch {
      return [];
    }
  }

  if (vertical === 'cruises') {
    try {
      const sailings = await api.listCruiseSailings({ limit: 20 });
      return sailings.data.map((s) => ({ id: s.id, title: `Cruise ${s.id.slice(0, 8)}`, subtitle: `Departure ${s.departureDate}`, priceLabel: 'On request' }));
    } catch {
      return [];
    }
  }

  try {
    const activities = await api.listActivities({ limit: 20, search: search || undefined });
    return activities.data.map((a) => ({ id: a.id, title: a.title, subtitle: a.description ?? 'Guided activity', priceLabel: `${Math.round(a.priceCents / 100)} ${a.currency}` }));
  } catch {
    return [];
  }
}