'use client';

import { useScrollAnimation } from './use-scroll-animation';

/* ── Partner logos (text-based placeholders styled as logos) ── */
const PARTNERS = [
  { name: 'Kenya Airways', initials: 'KA', bg: '#c8102e' },
  { name: 'Ethiopian Airlines', initials: 'ET', bg: '#008751' },
  { name: 'Royal Air Maroc', initials: 'RM', bg: '#003b73' },
  { name: 'South African Airways', initials: 'SA', bg: '#002855' },
  { name: 'RwandAir', initials: 'RW', bg: '#1a9ed7' },
  { name: 'Air Tanzania', initials: 'AT', bg: '#ffc423' },
];

export function PartnersSection() {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section ref={ref} className="border-y border-gray-100 bg-white py-12 transition-colors dark:border-atg-border dark:bg-atg-elevated sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-6">
          {PARTNERS.map((partner, i) => (
            <div
              key={partner.name}
              className={`group flex items-center justify-center ${
                isVisible ? 'animate-flip-in-x' : 'opacity-0'
              }`}
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <a
                href="#"
                className="flex flex-col items-center gap-2 transition-transform duration-300 group-hover:scale-110"
                title={partner.name}
              >
                {/* Logo circle */}
                <div
                  className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-white font-bold text-lg sm:text-xl shadow-md transition-shadow duration-300 group-hover:shadow-lg opacity-60 group-hover:opacity-100"
                  style={{ backgroundColor: partner.bg }}
                >
                  {partner.initials}
                </div>
                <span className="hidden text-center text-xs text-gray-400 transition-colors group-hover:text-gray-600 dark:text-atg-muted dark:group-hover:text-white sm:block">
                  {partner.name}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
