'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '../../../../../../../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../../../../../../../lib/croisieres-errors';
import { ItineraryPortsSection } from '../../../../../../../../components/cruises/itinerary-ports-section';

type PageProps = { params: { shipId: string; itineraryId: string } };

export default function ItineraryPortsPage({ params }: PageProps) {
  const { shipId, itineraryId } = params;
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getApiClient()
      .getItinerary(itineraryId)
      .then((it) => setName(it.name))
      .catch((e) => setError(getCroisieresErrorMessage(e)));
  }, [itineraryId]);

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (!name) {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  return (
    <ItineraryPortsSection
      shipId={shipId}
      itineraryId={itineraryId}
      itineraryName={name}
    />
  );
}
