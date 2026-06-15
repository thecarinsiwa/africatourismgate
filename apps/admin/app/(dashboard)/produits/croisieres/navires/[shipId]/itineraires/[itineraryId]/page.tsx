'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '../../../../../../../../lib/auth/api';
import { getCroisieresErrorMessage } from '../../../../../../../../lib/croisieres-errors';
import { ItineraryPortsSection } from '../../../../../../../../components/cruises/itinerary-ports-section';

type PageProps = { params: { shipId: string; itineraryId: string } };

export default function ItineraryPortsPage({ params }: PageProps) {
  const { shipId, itineraryId } = params;
  const [name, setName] = useState<string | null>(null);
  const [shipName, setShipName] = useState<string | null>(null);
  const [lineName, setLineName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const client = getApiClient();
        const [itinerary, ship] = await Promise.all([
          client.getItinerary(itineraryId),
          client.getShip(shipId),
        ]);
        const line = await client.getCruiseLine(ship.cruiseLineId);
        setName(itinerary.name);
        setShipName(ship.name);
        setLineName(line.name);
      } catch (e) {
        setError(getCroisieresErrorMessage(e));
      }
    })();
  }, [itineraryId, shipId]);

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (!name || !lineName) {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  return (
    <ItineraryPortsSection
      shipId={shipId}
      shipName={shipName ?? undefined}
      lineName={lineName}
      itineraryId={itineraryId}
      itineraryName={name}
    />
  );
}
