import type { Metadata } from 'next';
import { FlightDetailPageContent } from '../../../components/flights/flight-detail-page-content';
import { getFlightDetail } from '../../../lib/api/public';
import {
  normalizeFlightsSearchParams,
  readSearchParam,
  toFlightDetailQuery,
} from '../../../lib/flights/listings';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const normalized = normalizeFlightsSearchParams(searchParams);
  const apiQuery = toFlightDetailQuery(normalized);

  if (!apiQuery) {
    return {
      title: 'Vol',
      description: 'Fiche vol — Africa Tourism Gate',
    };
  }

  try {
    const detail = await getFlightDetail(params.id, apiQuery);
    return {
      title: `${detail.airlineName} ${detail.flightNumber}`,
      description: `Réservez ${detail.flightNumber} de ${detail.departureAirport.city} vers ${detail.arrivalAirport.city}.`,
    };
  } catch {
    return {
      title: 'Vol',
      description: 'Fiche vol — Africa Tourism Gate',
    };
  }
}

export default function FlightDetailPage({ params, searchParams }: PageProps) {
  const normalized = normalizeFlightsSearchParams(searchParams);
  const initialSearch = {
    ...normalized,
    classId: readSearchParam(searchParams.classId),
  };

  return (
    <FlightDetailPageContent flightId={params.id} initialSearch={initialSearch} />
  );
}
