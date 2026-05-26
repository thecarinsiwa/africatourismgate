'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const HERO_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/e/e8/Serengeti_sunset-1001.jpg';

/* ── Types ────────────────────────────────────────────── */
type SearchTab = 'stays' | 'flights' | 'cars' | 'packages' | 'activities' | 'cruises';

interface Room {
  adults: number;
  children: number;
  childAges: number[];
}

/* ── Tab definitions ─────────────────────────────────── */
const TABS: { id: SearchTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'stays',
    label: 'Hébergements',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
      </svg>
    ),
  },
  {
    id: 'flights',
    label: 'Vols',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    id: 'cars',
    label: 'Voitures',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h8M6 11l2-4h8l2 4M5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
      </svg>
    ),
  },
  {
    id: 'packages',
    label: 'Forfaits',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'activities',
    label: 'Activités',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    id: 'cruises',
    label: 'Croisières',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18h18M5 14l-2-6h18l-2 6M8 10V6a4 4 0 018 0v4" />
      </svg>
    ),
  },
];

/* ── Stepper sub-component ───────────────────────────── */
function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-atg-fg">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-atg-border text-atg-fg transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Diminuer ${label}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-6 text-center text-sm font-semibold text-atg-fg">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-atg-border text-atg-fg transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Augmenter ${label}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Compact field wrapper (Expedia pill-style) ──────── */
function FieldWrapper({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <label className="text-xs font-semibold text-atg-muted uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

/* ── Main component ──────────────────────────────────── */
export function HeroSearch() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>('stays');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  /* ── Travellers state ─────────────────────────────── */
  const [rooms, setRooms] = useState<Room[]>([{ adults: 2, children: 0, childAges: [] }]);
  const [travellersOpen, setTravellersOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalGuests = rooms.reduce((sum, r) => sum + r.adults + r.children, 0);
  const travellersSummary =
    rooms.length === 1
      ? `1 chambre, ${totalGuests} voyageur${totalGuests > 1 ? 's' : ''}`
      : `${rooms.length} chambres, ${totalGuests} voyageur${totalGuests > 1 ? 's' : ''}`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setTravellersOpen(false);
      }
    }
    if (travellersOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [travellersOpen]);

  const updateRoom = useCallback(
    (idx: number, patch: Partial<Room>) => {
      setRooms((prev) =>
        prev.map((r, i) => {
          if (i !== idx) return r;
          const updated = { ...r, ...patch };
          if (patch.children !== undefined) {
            const ages = [...updated.childAges];
            while (ages.length < updated.children) ages.push(0);
            updated.childAges = ages.slice(0, updated.children);
          }
          return updated;
        }),
      );
    },
    [],
  );

  const addRoom = () => {
    if (rooms.length < 4) setRooms((prev) => [...prev, { adults: 2, children: 0, childAges: [] }]);
  };

  const removeRoom = (idx: number) => {
    if (rooms.length > 1) setRooms((prev) => prev.filter((_, i) => i !== idx));
  };

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (activeTab === 'stays') {
      const params = new URLSearchParams();
      if (destination.trim()) params.set('destination', destination.trim());
      if (checkIn) params.set('checkIn', checkIn);
      if (checkOut) params.set('checkOut', checkOut);
      params.set('guests', String(totalGuests));
      params.set('rooms', String(rooms.length));
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
    <section className="relative min-h-[560px] sm:min-h-[600px] lg:min-h-[640px] flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        role="img"
        aria-label="Paysage africain au coucher du soleil"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1b2f]/70 via-black/40 to-[#1b1b2f]/80" />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        {/* Headline */}
        <div className="text-center max-w-3xl mx-auto animate-fade-in-up mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
            Explorez l&apos;Afrique
          </h1>
          <p className="mt-4 text-lg text-white/85 sm:text-xl">
            Trouvez et réservez hébergements, vols et expériences à travers tout le continent.
          </p>
        </div>

        {/* ── Search card ─────────────────────────────── */}
        <div className="max-w-5xl mx-auto animate-fade-in-up delay-200">
          <div className="rounded-2xl bg-white shadow-2xl overflow-hidden" role="search">
            {/* Tabs */}
            <div
              className="flex overflow-x-auto border-b border-gray-200 bg-gray-50"
              role="tablist"
              aria-label="Type de recherche"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`flex min-h-[52px] shrink-0 items-center gap-2 border-b-[3px] -mb-px px-4 sm:px-5 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#1b1b2f] text-[#1b1b2f] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSearch} className="p-4 sm:p-6">
              {/* ── Stays ────────────────────────────────── */}
              {activeTab === 'stays' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <FieldWrapper label="Où allez-vous ?" className="sm:col-span-2 lg:col-span-1">
                    <input
                      name="destination"
                      placeholder="Nairobi, Le Cap, Marrakech…"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1b1b2f] focus:ring-2 focus:ring-[#1b1b2f]/20 focus:outline-none transition-colors"
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Dates">
                    <div className="flex min-h-[44px] items-center rounded-lg border border-gray-300 overflow-hidden">
                      <input
                        name="checkIn"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="flex-1 min-w-0 border-0 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-0 focus:outline-none"
                      />
                      <div className="w-px h-6 bg-gray-300" />
                      <input
                        name="checkOut"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="flex-1 min-w-0 border-0 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </FieldWrapper>

                  {/* Travellers trigger */}
                  <div className="relative" ref={panelRef}>
                    <FieldWrapper label="Voyageurs">
                      <button
                        type="button"
                        onClick={() => setTravellersOpen((o) => !o)}
                        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:border-[#1b1b2f] transition-colors"
                        aria-expanded={travellersOpen}
                        aria-haspopup="dialog"
                      >
                        <span className="truncate">{travellersSummary}</span>
                        <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${travellersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </FieldWrapper>

                    {/* Travellers panel */}
                    {travellersOpen && (
                      <div className="travellers-panel absolute left-0 right-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-xl sm:min-w-[320px] sm:right-auto sm:w-[360px]">
                        {rooms.map((room, idx) => (
                          <div key={idx} className={idx > 0 ? 'mt-4 border-t border-gray-100 pt-4' : ''}>
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-900">
                                Chambre {idx + 1}
                              </p>
                              {rooms.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRoom(idx)}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              <Stepper label="Adultes" value={room.adults} min={1} max={14} onChange={(v) => updateRoom(idx, { adults: v })} />
                              <Stepper label="Enfants" value={room.children} min={0} max={6} onChange={(v) => updateRoom(idx, { children: v })} />
                              {room.childAges.length > 0 && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  {room.childAges.map((age, ci) => (
                                    <div key={ci}>
                                      <label className="mb-0.5 block text-xs text-gray-500">Âge enfant {ci + 1}</label>
                                      <select
                                        value={age}
                                        onChange={(e) => {
                                          const ages = [...room.childAges];
                                          ages[ci] = Number(e.target.value);
                                          updateRoom(idx, { childAges: ages });
                                        }}
                                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                                      >
                                        {Array.from({ length: 18 }, (_, i) => (
                                          <option key={i} value={i}>
                                            {i === 0 ? '< 1 an' : `${i} an${i > 1 ? 's' : ''}`}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {rooms.length < 4 && (
                          <button
                            type="button"
                            onClick={addRoom}
                            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Ajouter une chambre
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setTravellersOpen(false)}
                          className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#1b1b2f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a45] transition-colors"
                        >
                          Terminé
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Search button */}
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#1b1b2f] px-6 py-3 text-sm font-bold text-white hover:bg-[#2a2a45] transition-colors lg:w-auto"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Rechercher
                    </button>
                  </div>
                </div>
              )}

              {/* ── Flights ──────────────────────────────── */}
              {activeTab === 'flights' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FieldWrapper label="Départ">
                    <input placeholder="Aéroport ou ville" value={from} onChange={(e) => setFrom(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1b1b2f] focus:ring-2 focus:ring-[#1b1b2f]/20 focus:outline-none" />
                  </FieldWrapper>
                  <FieldWrapper label="Arrivée">
                    <input placeholder="Aéroport ou ville" value={to} onChange={(e) => setTo(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1b1b2f] focus:ring-2 focus:ring-[#1b1b2f]/20 focus:outline-none" />
                  </FieldWrapper>
                  <FieldWrapper label="Aller">
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#1b1b2f] focus:ring-2 focus:ring-[#1b1b2f]/20 focus:outline-none" />
                  </FieldWrapper>
                  <FieldWrapper label="Retour">
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#1b1b2f] focus:ring-2 focus:ring-[#1b1b2f]/20 focus:outline-none" />
                  </FieldWrapper>
                </div>
              )}

              {/* ── Other verticals ──────────────────────── */}
              {(activeTab === 'cars' || activeTab === 'cruises' || activeTab === 'activities' || activeTab === 'packages') && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <FieldWrapper label="Destination" className="sm:col-span-2">
                    <input
                      placeholder={
                        activeTab === 'cars' ? 'Lieu de prise en charge' : activeTab === 'cruises' ? 'Port ou région' : activeTab === 'packages' ? 'Ville ou pays' : 'Ville ou activité'
                      }
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1b1b2f] focus:ring-2 focus:ring-[#1b1b2f]/20 focus:outline-none"
                    />
                  </FieldWrapper>
                  <FieldWrapper label={activeTab === 'activities' ? 'Date' : 'Dates'}>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#1b1b2f] focus:ring-2 focus:ring-[#1b1b2f]/20 focus:outline-none" />
                  </FieldWrapper>
                </div>
              )}

              {/* Non-stays notice + search button for non-stays */}
              {activeTab !== 'stays' && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    <span className="mr-2 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600">
                      Bientôt disponible
                    </span>
                    La recherche redirige vers nos offres d&apos;hôtels.
                  </p>
                  <button
                    type="submit"
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#1b1b2f] px-6 py-3 text-sm font-bold text-white hover:bg-[#2a2a45] transition-colors sm:w-auto"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Rechercher
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Membership banner */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-3 text-white">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-sm font-medium">
              Les membres économisent <strong>10&nbsp;%</strong> ou plus sur certains hébergements.{' '}
              <a href="#connexion" className="underline underline-offset-2 hover:text-white/80">
                Créez un compte gratuit
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
