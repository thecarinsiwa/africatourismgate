'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/* ── Tab definitions ─────────────────────────────────── */
type SearchTab = 'flights' | 'hotels' | 'cars' | 'cruises' | 'tours';

const TABS: { id: SearchTab; label: string; iconClass: string }[] = [
  { id: 'flights', label: 'Vols', iconClass: 'flights' },
  { id: 'hotels', label: 'Hôtels', iconClass: 'hotels' },
  { id: 'cars', label: 'Voitures', iconClass: 'cars' },
  { id: 'cruises', label: 'Croisières', iconClass: 'cruises' },
  { id: 'tours', label: 'Tours', iconClass: 'tours' },
];

/* Tab icon mapping */
function TabIcon({ tab }: { tab: SearchTab }) {
  switch (tab) {
    case 'flights':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      );
    case 'hotels':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
        </svg>
      );
    case 'cars':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17h8M6 11l2-4h8l2 4M5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
        </svg>
      );
    case 'cruises':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18h18M5 14l-2-6h18l-2 6M8 10V6a4 4 0 018 0v4" />
        </svg>
      );
    case 'tours':
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

/* African cities for destination dropdowns */
const AFRICAN_CITIES = [
  'Nairobi', 'Le Cap', 'Marrakech', 'Zanzibar', 'Kigali',
  'Lagos', 'Accra', 'Le Caire', 'Dakar', 'Casablanca',
  'Addis-Abeba', 'Dar es Salaam', 'Kampala', 'Kinshasa',
];

/* ── Styled form components ──────────────────────────── */
function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {children}
    </label>
  );
}

function FormInput({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
}: {
  type?: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0B6E4F] focus:ring-2 focus:ring-[#0B6E4F]/20 focus:outline-none transition-colors"
    />
  );
}

function FormSelect({
  name,
  placeholder,
  options,
  value,
  onChange,
}: {
  name: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0B6E4F] focus:ring-2 focus:ring-[#0B6E4F]/20 focus:outline-none transition-colors"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

/* ── Main Component ──────────────────────────────────── */
export function SearchTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>('hotels');

  /* Form state */
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [destination, setDestination] = useState('');
  const [adults, setAdults] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (departDate) params.set('checkIn', departDate);
    if (returnDate) params.set('checkOut', returnDate);
    if (adults) params.set('guests', adults);
    const qs = params.toString();
    router.push(qs ? `/hotels?${qs}` : '/hotels');
  }

  return (
    <section className="relative -mt-12 z-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white shadow-2xl overflow-hidden border border-gray-100">
          {/* ── Tab Bar ─────────────────────────────────── */}
          <div className="flex" role="tablist" aria-label="Type de recherche">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all border-b-[3px] ${
                  activeTab === tab.id
                    ? 'bg-[#0B6E4F] text-white border-[#095a40]'
                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <TabIcon tab={tab.id} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Form ───────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {/* Flights */}
            {activeTab === 'flights' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <FormLabel>Date départ</FormLabel>
                  <FormInput type="date" name="departDate" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>Date retour</FormLabel>
                  <FormInput type="date" name="returnDate" value={returnDate} onChange={setReturnDate} />
                </div>
                <div>
                  <FormLabel>De :</FormLabel>
                  <FormSelect name="from" placeholder="Ville" options={AFRICAN_CITIES} value={from} onChange={setFrom} />
                </div>
                <div>
                  <FormLabel>Vers :</FormLabel>
                  <FormSelect name="to" placeholder="Ville" options={AFRICAN_CITIES} value={to} onChange={setTo} />
                </div>
                <div>
                  <FormLabel>Adultes :</FormLabel>
                  <FormInput name="adults" placeholder="1" value={adults} onChange={setAdults} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full min-h-[44px] rounded-lg bg-[#0B6E4F] px-5 py-2.5 text-sm font-bold text-white uppercase tracking-wide hover:bg-[#095a40] transition-colors">
                    Rechercher
                  </button>
                </div>
              </div>
            )}

            {/* Hotels */}
            {activeTab === 'hotels' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <FormLabel>Check-in</FormLabel>
                  <FormInput type="date" name="checkIn" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>Check-out</FormLabel>
                  <FormInput type="date" name="checkOut" value={returnDate} onChange={setReturnDate} />
                </div>
                <div>
                  <FormLabel>Destination :</FormLabel>
                  <FormSelect name="destination" placeholder="Destination ou hôtel" options={AFRICAN_CITIES} value={destination} onChange={setDestination} />
                </div>
                <div>
                  <FormLabel>Type de chambre :</FormLabel>
                  <FormSelect name="roomType" placeholder="Sélectionner" options={['Chambre Double', 'Chambre Simple', 'Suite']} value="" onChange={() => {}} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full min-h-[44px] rounded-lg bg-[#0B6E4F] px-5 py-2.5 text-sm font-bold text-white uppercase tracking-wide hover:bg-[#095a40] transition-colors">
                    Rechercher
                  </button>
                </div>
              </div>
            )}

            {/* Cars */}
            {activeTab === 'cars' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <FormLabel>Prise en charge</FormLabel>
                  <FormInput type="date" name="pickUp" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>Retour</FormLabel>
                  <FormInput type="date" name="dropOff" value={returnDate} onChange={setReturnDate} />
                </div>
                <div>
                  <FormLabel>Pays :</FormLabel>
                  <FormSelect name="country" placeholder="Pays" options={['Kenya', 'Tanzanie', 'Maroc', 'Afrique du Sud', 'Rwanda', 'RDC']} value="" onChange={() => {}} />
                </div>
                <div>
                  <FormLabel>Ville :</FormLabel>
                  <FormSelect name="city" placeholder="Ville" options={AFRICAN_CITIES} value={destination} onChange={setDestination} />
                </div>
                <div>
                  <FormLabel>Lieu :</FormLabel>
                  <FormSelect name="location" placeholder="Lieu" options={['Aéroport', 'Centre-ville', 'Gare']} value="" onChange={() => {}} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full min-h-[44px] rounded-lg bg-[#0B6E4F] px-5 py-2.5 text-sm font-bold text-white uppercase tracking-wide hover:bg-[#095a40] transition-colors">
                    Rechercher
                  </button>
                </div>
              </div>
            )}

            {/* Cruises */}
            {activeTab === 'cruises' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <FormLabel>Date début</FormLabel>
                  <FormInput type="date" name="startDate" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>Date fin</FormLabel>
                  <FormInput type="date" name="endDate" value={returnDate} onChange={setReturnDate} />
                </div>
                <div>
                  <FormLabel>Naviguer vers :</FormLabel>
                  <FormSelect name="sailTo" placeholder="Toutes destinations" options={['Zanzibar', 'Madagascar', 'Île Maurice', 'Seychelles', 'Mombasa', 'Le Cap']} value={to} onChange={setTo} />
                </div>
                <div>
                  <FormLabel>Naviguer de :</FormLabel>
                  <FormSelect name="sailFrom" placeholder="Tous les ports" options={['Dar es Salaam', 'Mombasa', 'Le Cap', 'Durban', 'Maputo']} value={from} onChange={setFrom} />
                </div>
                <div>
                  <FormLabel>Navire :</FormLabel>
                  <FormSelect name="ship" placeholder="Navire" options={['African Queen', 'Safari Voyager', 'Indian Ocean Star']} value="" onChange={() => {}} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full min-h-[44px] rounded-lg bg-[#0B6E4F] px-5 py-2.5 text-sm font-bold text-white uppercase tracking-wide hover:bg-[#095a40] transition-colors">
                    Rechercher
                  </button>
                </div>
              </div>
            )}

            {/* Tours */}
            {activeTab === 'tours' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                  <FormLabel>Date début</FormLabel>
                  <FormInput type="date" name="startDate" value={departDate} onChange={setDepartDate} />
                </div>
                <div>
                  <FormLabel>De :</FormLabel>
                  <FormSelect name="from" placeholder="Ville de départ" options={AFRICAN_CITIES} value={from} onChange={setFrom} />
                </div>
                <div>
                  <FormLabel>Vers :</FormLabel>
                  <FormSelect name="to" placeholder="Destination" options={AFRICAN_CITIES} value={to} onChange={setTo} />
                </div>
                <div>
                  <FormLabel>Adultes :</FormLabel>
                  <FormInput name="adults" placeholder="2" value={adults} onChange={setAdults} />
                </div>
                <div>
                  <FormLabel>Jours :</FormLabel>
                  <FormInput name="days" placeholder="7" value="" onChange={() => {}} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full min-h-[44px] rounded-lg bg-[#0B6E4F] px-5 py-2.5 text-sm font-bold text-white uppercase tracking-wide hover:bg-[#095a40] transition-colors">
                    Rechercher
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
