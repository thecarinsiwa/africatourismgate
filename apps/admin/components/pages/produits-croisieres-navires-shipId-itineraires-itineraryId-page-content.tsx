'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { ItineraryPortsSection } from '../cruises/itinerary-ports-section';

type ItineraryPortsPageContentProps = {
  shipId: string;
  itineraryId: string;
};

export function ItineraryPortsPageContent({ shipId, itineraryId }: ItineraryPortsPageContentProps) {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const tLoading = useTranslations('common.loading');
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
  }, [getCroisieresErrorMessage, itineraryId, shipId]);

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (!name || !lineName) {
    return <p className="text-sm text-atg-muted">{tLoading('page')}</p>;
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
