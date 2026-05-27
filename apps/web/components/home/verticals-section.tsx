'use client';

import { useScrollAnimation } from './use-scroll-animation';
import { useTranslations } from '../../lib/i18n/locale-provider';

const WHY_US_ICONS = [
  (
      <svg key="icon-voyages" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  (
      <svg key="icon-decouvertes" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  (
      <svg key="icon-reservation" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  (
      <svg key="icon-support" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
];

export function WhyUsSection() {
  const t = useTranslations();
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      id="about"
      ref={ref}
      className="scroll-mt-24 bg-white py-16 transition-colors dark:bg-atg-surface sm:py-24"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-2xl mx-auto mb-14 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 id="why-heading" className="text-2xl font-bold uppercase tracking-wide text-[#0f1a16] dark:text-white sm:text-3xl">
            {t.whyUs.title}
          </h2>
          <p className="mt-4 leading-relaxed text-gray-500 dark:text-atg-muted">{t.whyUs.subtitle}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.whyUs.items.map((item, i) => (
            <div
              key={item.title}
              className={`group text-center ${isVisible ? 'animate-flip-in-y' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <div
                className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                style={{ borderColor: 'var(--atg-primary)', color: 'var(--atg-primary)' }}
              >
                {WHY_US_ICONS[i]}
              </div>

              <h3 className="mb-2 text-lg font-bold text-[#0f1a16] dark:text-white">{item.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-atg-muted">{item.description}</p>

              <a
                href="#about"
                className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
                style={{ color: 'var(--atg-primary)' }}
              >
                {t.whyUs.learnMore}
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
