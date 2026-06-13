import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VerticalComingSoonPage } from '../../../components/vertical-coming-soon-page';
import { isSearchVertical, type SearchVertical } from '../../../lib/search/route';

type PageProps = {
  params: { vertical: string };
};

const VERTICAL_LABELS: Record<SearchVertical, string> = {
  hotels: 'Hébergements',
  flights: 'Vols',
  cars: 'Location de voitures',
  cruises: 'Croisières',
  tours: 'Activités & tours',
};

export function generateMetadata({ params }: PageProps): Metadata {
  if (!isSearchVertical(params.vertical)) {
    return { title: 'Bientôt disponible' };
  }

  const label = VERTICAL_LABELS[params.vertical];
  return {
    title: `${label} — Bientôt disponible`,
    description: `La réservation en ligne ${label.toLowerCase()} arrive bientôt sur Africa Tourism Gate.`,
    robots: { index: false, follow: false },
  };
}

export default function VerticalComingSoonRoute({ params }: PageProps) {
  if (!isSearchVertical(params.vertical)) {
    notFound();
  }

  return <VerticalComingSoonPage vertical={params.vertical} />;
}
