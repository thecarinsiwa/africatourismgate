'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { listPublicDestinations } from '../../lib/api/public';
import { toFlightAirportOptions, type FlightAirportOption } from '../../lib/flights/airports';
import { usePublicAirports } from '../../lib/flights/use-public-airports';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { buildSearchRoute, type SearchVertical } from '../../lib/search/route';

type SearchTab = SearchVertical;

const AFRICAN_CITIES = [
  'Nairobi', 'Le Cap', 'Marrakech', 'Zanzibar', 'Kigali',
  'Lagos', 'Accra', 'Le Caire', 'Dakar', 'Casablanca',
  'Addis-Abeba', 'Dar es Salaam', 'Kampala', 'Kinshasa',
];

const CRUISE_DESTINATIONS = ['Zanzibar', 'Madagascar', 'Île Maurice', 'Seychelles', 'Mombasa', 'Le Cap'];
const CRUISE_PORTS = ['Dar es Salaam', 'Mombasa', 'Le Cap', 'Durban', 'Maputo'];
const CRUISE_SHIPS = ['African Queen', 'Safari Voyager', 'Indian Ocean Star'];

function TabIcon({ tab }: { tab: SearchTab }) {
  switch (tab) {
    case 'flights':
      return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
    case 'hotels':
      return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></svg>;
    case 'cars':
      return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h8M6 11l2-4h8l2 4M5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" /></svg>;
    case 'cruises':
      return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18h18M5 14l-2-6h18l-2 6M8 10V6a4 4 0 018 0v4" /></svg>;
    case 'tours':
      return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">{children}</label>;
}

function FormInput({ type = 'text', name, placeholder, value, min, onChange }: { type?: string; name: string; placeholder?: string; value: string; min?: string; onChange: (v: string) => void; }) {
  return <input type={type} name={name} placeholder={placeholder} value={value} min={min} onChange={(e) => onChange(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg dark:placeholder:text-atg-muted" />;
}

function FormSelect({ name, placeholder, options, value, onChange }: { name: string; placeholder: string; options: string[]; value: string; onChange: (v: string) => void; }) {
  return (
    <select name={name} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg">
      <option value="">{placeholder}</option>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

type FlightTripType = 'oneWay' | 'roundTrip';

function FlightTripTypeToggle({
  value,
  oneWayLabel,
  roundTripLabel,
  ariaLabel,
  onChange,
}: {
  value: FlightTripType;
  oneWayLabel: string;
  roundTripLabel: string;
  ariaLabel: string;
  onChange: (tripType: FlightTripType) => void;
}) {
  const options: { id: FlightTripType; label: string }[] = [
    { id: 'oneWay', label: oneWayLabel },
    { id: 'roundTrip', label: roundTripLabel },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-atg-border dark:bg-atg-surface"
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              selected
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 dark:text-atg-muted dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FormAirportSelect({
  name,
  placeholder,
  value,
  options,
  disabled,
  onChange,
}: {
  name: string;
  placeholder: string;
  value: string;
  options: FlightAirportOption[];
  disabled?: boolean;
  onChange: (iata: string) => void;
}) {
  return (
    <select
      name={name}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg"
    >
      <option value="">{placeholder}</option>
      {options.map((airport) => (
        <option key={airport.iataCode} value={airport.iataCode}>
          {airport.label}
        </option>
      ))}
    </select>
  );
}

export function SearchTabs() {
  const t = useTranslations();
  const router = useRouter();
  const { airports, loading: airportsLoading, error: airportsError } = usePublicAirports();
  const airportOptions = useMemo(() => toFlightAirportOptions(airports), [airports]);
  const [activeTab, setActiveTab] = useState<SearchTab>('hotels');
  const tabs = useMemo(() => ([
    { id: 'flights' as const, label: t.search.tabs.flights },
    { id: 'hotels' as const, label: t.search.tabs.hotels },
    { id: 'cars' as const, label: t.search.tabs.cars },
    { id: 'cruises' as const, label: t.search.tabs.cruises },
    { id: 'tours' as const, label: t.search.tabs.tours },
  ]), [t]);

  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [flightFrom, setFlightFrom] = useState('');
  const [flightTo, setFlightTo] = useState('');
  const [flightPassengers, setFlightPassengers] = useState('1');
  const [flightTripType, setFlightTripType] = useState<FlightTripType>('oneWay');
  const [flightError, setFlightError] = useState<string | null>(null);
  const [carError, setCarError] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  const [adults, setAdults] = useState('');
  const [hotelGuests, setHotelGuests] = useState('2');
  const [destinationOptions, setDestinationOptions] = useState<string[]>(AFRICAN_CITIES);

  useEffect(() => {
    let cancelled = false;
    void listPublicDestinations()
      .then((dests) => {
        if (cancelled || !dests.length) return;
        const names = dests.map((d) => d.name);
        const merged = Array.from(new Set([...names, ...AFRICAN_CITIES])).sort((a, b) =>
          a.localeCompare(b),
        );
        setDestinationOptions(merged);
      })
      .catch(() => {
        /* keep static fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();

    if (activeTab === 'flights') {
      setFlightError(null);

      if (!flightFrom || !flightTo || !departDate) {
        setFlightError(t.search.flightRequired);
        return;
      }

      if (flightFrom === flightTo) {
        setFlightError(t.search.flightSameAirport);
        return;
      }

      if (flightTripType === 'roundTrip' && !returnDate) {
        setFlightError(t.search.flightReturnRequired);
        return;
      }

      if (returnDate && returnDate <= departDate) {
        setFlightError(t.search.flightReturnAfterDeparture);
        return;
      }

      const passengers = Math.max(1, Number.parseInt(flightPassengers, 10) || 1);

      params.set('from', flightFrom);
      params.set('to', flightTo);
      params.set('departureDate', departDate);
      if (flightTripType === 'roundTrip' && returnDate) params.set('returnDate', returnDate);
      params.set('passengers', String(passengers));
      router.push(buildSearchRoute('flights', params));
      return;
    }

    if (activeTab === 'cars') {
      setCarError(null);

      if (!destination || !departDate || !returnDate) {
        setCarError(t.search.carsRequired);
        return;
      }

      if (returnDate <= departDate) {
        setCarError(t.search.carsReturnAfterPickup);
        return;
      }

      params.set('pickupLocation', destination);
      params.set('pickupDate', departDate);
      params.set('returnDate', returnDate);
      router.push(buildSearchRoute('cars', params));
      return;
    }

    if (destination) params.set('destination', destination);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (departDate) params.set('checkIn', departDate);
    if (returnDate) params.set('checkOut', returnDate);
    const guestsValue = activeTab === 'hotels' ? hotelGuests : adults;
    if (guestsValue) params.set('guests', guestsValue);
    router.push(buildSearchRoute(activeTab, params));
  }

  function swapFlightAirports() {
    setFlightFrom(flightTo);
    setFlightTo(flightFrom);
    setFlightError(null);
  }

  function handleFlightTripTypeChange(tripType: FlightTripType) {
    setFlightTripType(tripType);
    if (tripType === 'oneWay') {
      setReturnDate('');
    }
    setFlightError(null);
  }

  const submitBtn = <button type="submit" className="min-h-[44px] w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover">{t.search.search}</button>;

  return (
    <section id="search" className="relative -mt-12 z-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl transition-colors dark:border-atg-border dark:bg-atg-elevated">
          <div className="flex" role="tablist" aria-label={t.search.tablistAria}>
            {tabs.map((tab) => (
              <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setFlightError(null); setCarError(null); }} className={`flex flex-1 items-center justify-center gap-2 py-4 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all border-b-[3px] ${activeTab === tab.id ? 'bg-primary text-white border-primary-hover' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700 dark:bg-atg-surface dark:text-atg-muted dark:hover:bg-white/5 dark:hover:text-white'}`}>
                <TabIcon tab={tab.id} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {activeTab === 'flights' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <FlightTripTypeToggle
                    value={flightTripType}
                    oneWayLabel={t.search.oneWay}
                    roundTripLabel={t.search.roundTrip}
                    ariaLabel={t.search.tripTypeAria}
                    onChange={handleFlightTripTypeChange}
                  />
                  <Link
                    href="/flights"
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
                  >
                    {t.search.viewAllFlights}
                  </Link>
                </div>
                <div className={`grid gap-4 sm:grid-cols-2 ${flightTripType === 'roundTrip' ? 'lg:grid-cols-[1fr_1fr_auto_1fr_1fr_0.75fr_auto]' : 'lg:grid-cols-[1fr_1fr_auto_1fr_0.75fr_auto]'} lg:items-end`}>
                  <div>
                    <FormLabel>{t.search.from}</FormLabel>
                    <FormAirportSelect
                      name="from"
                      placeholder={
                        airportsLoading ? t.flights.loading : t.search.airportPh
                      }
                      value={flightFrom}
                      options={airportOptions}
                      disabled={airportsLoading || airportOptions.length === 0}
                      onChange={(value) => {
                        setFlightFrom(value);
                        setFlightError(null);
                      }}
                    />
                  </div>
                  <div className="relative">
                    <FormLabel>{t.search.to}</FormLabel>
                    <FormAirportSelect
                      name="to"
                      placeholder={
                        airportsLoading ? t.flights.loading : t.search.airportPh
                      }
                      value={flightTo}
                      options={airportOptions}
                      disabled={airportsLoading || airportOptions.length === 0}
                      onChange={(value) => {
                        setFlightTo(value);
                        setFlightError(null);
                      }}
                    />
                  </div>
                  <div className="flex items-end pb-0.5 lg:justify-center">
                    <button
                      type="button"
                      onClick={swapFlightAirports}
                      aria-label={t.search.swapAirports}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-atg-muted dark:hover:text-white"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <FormLabel>{t.search.departDate}</FormLabel>
                    <FormInput
                      type="date"
                      name="departureDate"
                      value={departDate}
                      onChange={(value) => {
                        setDepartDate(value);
                        setFlightError(null);
                      }}
                    />
                  </div>
                  {flightTripType === 'roundTrip' && (
                    <div>
                      <FormLabel>{t.search.returnDate}</FormLabel>
                      <FormInput
                        type="date"
                        name="returnDate"
                        value={returnDate}
                        min={departDate || undefined}
                        onChange={(value) => {
                          setReturnDate(value);
                          setFlightError(null);
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <FormLabel>{t.search.passengers}</FormLabel>
                    <FormInput
                      type="number"
                      name="passengers"
                      placeholder="1"
                      value={flightPassengers}
                      min="1"
                      onChange={(value) => setFlightPassengers(value)}
                    />
                  </div>
                  <div className="flex items-end">{submitBtn}</div>
                </div>
                {airportsError && (
                  <p className="text-sm text-amber-700 dark:text-amber-300" role="status">
                    {t.flights.loadError}
                  </p>
                )}
                {flightError && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {flightError}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <FormLabel>{t.search.checkIn}</FormLabel>
                  <FormInput type="date" name="checkIn" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>{t.search.checkOut}</FormLabel>
                  <FormInput type="date" name="checkOut" value={returnDate} onChange={setReturnDate} />
                </div>
                <div>
                  <FormLabel>{t.search.destination}</FormLabel>
                  <FormSelect
                    name="destination"
                    placeholder={t.search.destinationPh}
                    options={destinationOptions}
                    value={destination}
                    onChange={setDestination}
                  />
                </div>
                <div>
                  <FormLabel>{t.hotels.guests}</FormLabel>
                  <FormInput
                    name="guests"
                    type="number"
                    placeholder="2"
                    value={hotelGuests}
                    onChange={setHotelGuests}
                  />
                </div>
                <div>
                  <FormLabel>{t.search.roomType}</FormLabel>
                  <FormSelect name="roomType" placeholder={t.search.selectPh} options={t.search.roomTypes} value="" onChange={() => {}} />
                </div>
                <div className="flex items-end">{submitBtn}</div>
              </div>
            )}

            {activeTab === 'cars' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Link
                    href="/cars"
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 dark:hover:bg-primary/10"
                  >
                    {t.search.viewAllCars}
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <FormLabel>{t.cars.pickupLocation}</FormLabel>
                    <FormSelect
                      name="pickupLocation"
                      placeholder={t.search.destinationPh}
                      options={destinationOptions}
                      value={destination}
                      onChange={(value) => {
                        setDestination(value);
                        setCarError(null);
                      }}
                    />
                  </div>
                  <div>
                    <FormLabel>{t.search.pickUp}</FormLabel>
                    <FormInput
                      type="date"
                      name="pickUp"
                      value={departDate}
                      onChange={(value) => {
                        setDepartDate(value);
                        setCarError(null);
                      }}
                    />
                  </div>
                  <div>
                    <FormLabel>{t.search.dropOff}</FormLabel>
                    <FormInput
                      type="date"
                      name="dropOff"
                      value={returnDate}
                      min={departDate || undefined}
                      onChange={(value) => {
                        setReturnDate(value);
                        setCarError(null);
                      }}
                    />
                  </div>
                  <div className="flex items-end">{submitBtn}</div>
                </div>
                {carError && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {carError}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'cruises' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <FormLabel>{t.search.startDate}</FormLabel>
                  <FormInput type="date" name="startDate" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>{t.search.endDate}</FormLabel>
                  <FormInput type="date" name="endDate" value={returnDate} onChange={setReturnDate} />
                </div>
                <div>
                  <FormLabel>{t.search.sailTo}</FormLabel>
                  <FormSelect name="sailTo" placeholder={t.search.allDestinations} options={CRUISE_DESTINATIONS} value={to} onChange={setTo} />
                </div>
                <div>
                  <FormLabel>{t.search.sailFrom}</FormLabel>
                  <FormSelect name="sailFrom" placeholder={t.search.allPorts} options={CRUISE_PORTS} value={from} onChange={setFrom} />
                </div>
                <div>
                  <FormLabel>{t.search.ship}</FormLabel>
                  <FormSelect name="ship" placeholder={t.search.shipPh} options={CRUISE_SHIPS} value="" onChange={() => {}} />
                </div>
                <div className="flex items-end">{submitBtn}</div>
              </div>
            )}

            {activeTab === 'tours' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <FormLabel>{t.search.startDate}</FormLabel>
                  <FormInput type="date" name="startDate" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>{t.search.from}</FormLabel>
                  <FormSelect name="from" placeholder={t.search.departCityPh} options={AFRICAN_CITIES} value={from} onChange={setFrom} />
                </div>
                <div>
                  <FormLabel>{t.search.to}</FormLabel>
                  <FormSelect name="to" placeholder={t.search.destinationPh2} options={AFRICAN_CITIES} value={to} onChange={setTo} />
                </div>
                <div>
                  <FormLabel>{t.search.adults}</FormLabel>
                  <FormInput name="adults" placeholder="2" value={adults} onChange={setAdults} />
                </div>
                <div>
                  <FormLabel>{t.search.days}</FormLabel>
                  <FormInput name="days" placeholder="7" value="" onChange={() => {}} />
                </div>
                <div className="flex items-end">{submitBtn}</div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
