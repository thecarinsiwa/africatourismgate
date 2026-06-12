import type { Metadata } from 'next';
import { CruiseDetailPageContent } from '../../../components/cruises/cruise-detail-page-content';
import { getCruiseSailingDetail } from '../../../lib/api/public';
import {
  normalizeCruisesSearchParams,
  parseGuestsParam,
  toCruiseSailingDetailQuery,
} from '../../../lib/cruises/listings';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const normalized = normalizeCruisesSearchParams(searchParams);
  const apiQuery = toCruiseSailingDetailQuery(normalized);

  try {
    const detail = await getCruiseSailingDetail(params.id, apiQuery);
    return {
      title: detail.itineraryName,
      description: `Croisière ${detail.itineraryName} à bord du ${detail.shipName} avec Africa Tourism Gate.`,
    };
  } catch {
    return {
      title: 'Croisière',
      description: 'Fiche croisière — Africa Tourism Gate',
    };
  }
}

export default function CruiseDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = normalizeCruisesSearchParams(searchParams);
  const guests = parseGuestsParam(initialSearch.guests);

  return (
    <CruiseDetailPageContent
      sailingId={params.id}
      initialSearch={{
        ...initialSearch,
        guests: String(guests),
        cabinId: typeof searchParams.cabinId === 'string' ? searchParams.cabinId : undefined,
      }}
    />
  );
}
