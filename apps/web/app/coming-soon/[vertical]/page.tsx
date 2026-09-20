import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { VerticalComingSoonPage } from '../../../components/vertical-coming-soon-page';
import {
  buildSearchRoute,
  isSearchVertical,
  isSearchVerticalImplemented,
  type SearchVertical,
} from '../../../lib/search/route';

type PageProps = {
  params: { vertical: string };
  searchParams: Record<string, string | string[] | undefined>;
};

const VERTICAL_LABELS: Record<SearchVertical, string> = {
  hotels: 'Hébergements',
  flights: 'Vols',
  cars: 'Location de voitures',
  cruises: 'Croisières',
  tours: 'Activités & tours',
};

function toURLSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else {
      params.set(key, value);
    }
  }
  return params;
}

export function generateMetadata({ params }: PageProps): Metadata {
  if (!isSearchVertical(params.vertical)) {
    return { title: 'Bientôt disponible' };
  }

  if (isSearchVerticalImplemented(params.vertical)) {
    return { robots: { index: false, follow: false } };
  }

  const label = VERTICAL_LABELS[params.vertical];
  return {
    title: `${label} — Bientôt disponible`,
    description: `La réservation en ligne ${label.toLowerCase()} arrive bientôt sur Africa Tourism Gate.`,
    robots: { index: false, follow: false },
  };
}

export default function VerticalComingSoonRoute({ params, searchParams }: PageProps) {
  if (!isSearchVertical(params.vertical)) {
    notFound();
  }

  if (isSearchVerticalImplemented(params.vertical)) {
    redirect(buildSearchRoute(params.vertical, toURLSearchParams(searchParams)));
  }

  return <VerticalComingSoonPage vertical={params.vertical} />;
}
