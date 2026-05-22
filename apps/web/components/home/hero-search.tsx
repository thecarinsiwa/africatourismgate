'use client';

import { Button, Input } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const HERO_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg';

type SearchTab = 'stays' | 'flights' | 'cars' | 'cruises' | 'activities';

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'stays', label: 'Hébergements' },
  { id: 'flights', label: 'Vols' },
  { id: 'cars', label: 'Voitures' },
  { id: 'cruises', label: 'Croisières' },
  { id: 'activities', label: 'Activités' },
];

export function HeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>('stays');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (activeTab === 'stays') {
      const params = new URLSearchParams();
      if (destination.trim()) params.set('destination', destination.trim());
      if (checkIn) params.set('checkIn', checkIn);
      if (checkOut) params.set('checkOut', checkOut);
      if (guests) params.set('guests', guests);
      const qs = params.toString();
      router.push(qs ? `/hotels?${qs}` : '/hotels');
      return;
    }

    const params = new URLSearchParams({ vertical: activeTab });
    if (destination.trim()) params.set('destination', destination.trim());
    if (from.trim()) params.set('from', from.trim());
    if (to.trim()) params.set('to', to.trim());
    if (checkIn) params.set('date', checkIn);
    router.push(`/hotels?${params.toString()}`);
  }

  return (
    <section className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        role="img"
        aria-label="Paysage africain au coucher du soleil"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Où partez-vous ?
          </h1>
          <p className="mt-3 text-base text-white/90 sm:text-lg">
            Comparez hôtels, vols et expériences à travers l&apos;Afrique avec Africa Tourism Gate.
          </p>
        </div>

        <div className="mt-8 max-w-5xl">
          <div
            className="overflow-hidden rounded-2xl bg-atg-elevated shadow-2xl"
            role="search"
          >
            <div
              className="flex overflow-x-auto border-b border-atg-border scrollbar-thin"
              role="tablist"
              aria-label="Type de recherche"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`min-h-[48px] shrink-0 px-4 sm:px-6 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-atg-muted hover:text-atg-fg hover:bg-atg-surface'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="p-4 sm:p-6">
              {activeTab === 'stays' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Input
                    label="Destination"
                    name="destination"
                    placeholder="Ville, région ou pays"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="sm:col-span-2 lg:col-span-1"
                  />
                  <Input
                    label="Arrivée"
                    name="checkIn"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                  <Input
                    label="Départ"
                    name="checkOut"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                  <Input
                    label="Voyageurs"
                    name="guests"
                    type="number"
                    min={1}
                    max={20}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'flights' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Input
                    label="Départ"
                    placeholder="Aéroport ou ville"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <Input
                    label="Arrivée"
                    placeholder="Aéroport ou ville"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                  <Input
                    label="Aller"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                  <Input
                    label="Retour"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              )}

              {(activeTab === 'cars' || activeTab === 'cruises' || activeTab === 'activities') && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Destination"
                    placeholder={
                      activeTab === 'cars'
                        ? 'Lieu de prise en charge'
                        : activeTab === 'cruises'
                          ? 'Port ou région'
                          : 'Ville ou activité'
                    }
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    wrapperClassName="sm:col-span-2"
                  />
                  <Input
                    label={activeTab === 'activities' ? 'Date' : 'Dates'}
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                  {activeTab !== 'activities' && (
                    <Input
                      label="Retour"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      wrapperClassName="sm:col-span-2 lg:col-span-1"
                    />
                  )}
                </div>
              )}

              <p className="mt-3 text-xs text-atg-muted">
                {activeTab !== 'stays' && (
                  <span className="mr-2 rounded bg-atg-surface px-2 py-0.5 font-medium">
                    Bientôt disponible
                  </span>
                )}
                La recherche hébergements redirige vers nos offres d&apos;hôtels.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" size="lg" className="min-h-[48px] sm:min-w-[200px]">
                  Rechercher
                </Button>
                <Button href="/hotels" variant="outline" size="lg" className="min-h-[48px]">
                  Voir tous les hébergements
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
