'use client';

import { useScrollAnimation } from './use-scroll-animation';

/* ── Why Us items ─────────────────────────────────────── */
const WHY_US = [
  {
    title: 'Voyages Incroyables',
    description:
      'Des destinations uniques sélectionnées avec soin à travers tout le continent africain pour des expériences inoubliables.',
    color: '#0B6E4F',
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Découvertes',
    description:
      'Explorez la richesse culturelle, les paysages époustouflants et la faune sauvage de l\'Afrique.',
    color: '#199a45',
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'Réservation Facile',
    description:
      'Réservez vos hébergements, vols et activités en quelques clics grâce à notre plateforme intuitive.',
    color: '#0B6E4F',
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Support 24/7',
    description:
      'Notre équipe de spécialistes du voyage est disponible jour et nuit pour vous accompagner.',
    color: '#199a45',
    icon: (
      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export function WhyUsSection() {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="bg-white py-16 sm:py-24" aria-labelledby="why-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className={`text-center max-w-2xl mx-auto mb-14 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold text-[#0f1a16] uppercase tracking-wide">
            Pourquoi nous choisir
          </h2>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Africa Tourism Gate vous offre une expérience de voyage unique avec les meilleurs services et un accompagnement personnalisé pour découvrir l&apos;Afrique.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((item, i) => (
            <div
              key={item.title}
              className={`group text-center ${
                isVisible ? 'animate-flip-in-y' : 'opacity-0'
              }`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              {/* Icon circle */}
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  borderColor: item.color,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              <h3 className="text-lg font-bold text-[#0f1a16] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.description}</p>

              <a
                href="#"
                className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
                style={{ color: item.color }}
              >
                En savoir plus
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
