import Link from 'next/link';

const VERTICALS = [
  {
    id: 'stays',
    title: 'Hébergements',
    description: 'Hôtels, lodges et résidences dans toute l\'Afrique.',
    href: '/hotels',
    available: true,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"
        />
      </svg>
    ),
  },
  {
    id: 'flights',
    title: 'Vols',
    description: 'Comparez les vols vers les grandes capitales africaines.',
    href: '#vols',
    available: false,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    ),
  },
  {
    id: 'cars',
    title: 'Location de voitures',
    description: 'Louez un véhicule pour explorer à votre rythme.',
    href: '#voitures',
    available: false,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 17h8M6 11l2-4h8l2 4M5 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z"
        />
      </svg>
    ),
  },
  {
    id: 'cruises',
    title: 'Croisières',
    description: 'Croisières côtières et fluviales sur le continent.',
    href: '#croisieres',
    available: false,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 18h18M5 14l-2-6h18l-2 6M8 10V6a4 4 0 018 0v4"
        />
      </svg>
    ),
  },
  {
    id: 'activities',
    title: 'Activités',
    description: 'Safaris, excursions et expériences locales.',
    href: '#activites',
    available: false,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    id: 'packages',
    title: 'Forfaits',
    description: 'Séjours combinés vol + hôtel + activités.',
    href: '#forfaits',
    available: false,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
] as const;

function VerticalCard({
  vertical,
}: {
  vertical: (typeof VERTICALS)[number];
}) {
  const inner = (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {vertical.icon}
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-atg-fg">{vertical.title}</h3>
          {!vertical.available && (
            <span className="rounded-full bg-atg-surface px-2 py-0.5 text-xs font-medium text-atg-muted">
              Bientôt
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-atg-muted leading-relaxed">{vertical.description}</p>
      </div>
      {vertical.available && (
        <span className="mt-4 inline-flex text-sm font-semibold text-primary group-hover:underline">
          Explorer →
        </span>
      )}
    </>
  );

  const className =
    'group flex flex-col rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-sm transition-shadow hover:shadow-md hover:border-primary/30';

  if (vertical.available) {
    return (
      <Link href={vertical.href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={className} aria-disabled>
      {inner}
    </div>
  );
}

export function VerticalsSection() {
  return (
    <section className="bg-gradient-to-b from-atg-elevated to-atg-surface py-14 sm:py-20" aria-labelledby="verticals-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 id="verticals-heading" className="text-2xl font-bold text-atg-fg sm:text-3xl">
            Explorez nos services
          </h2>
          <p className="mt-3 text-atg-muted">
            Une plateforme, plusieurs verticales — commencez par les hébergements disponibles dès
            maintenant.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((vertical) => (
            <VerticalCard key={vertical.id} vertical={vertical} />
          ))}
        </div>
      </div>
    </section>
  );
}
