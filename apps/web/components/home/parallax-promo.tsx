'use client';

import { useScrollAnimation } from './use-scroll-animation';
import { useTranslations } from '../../lib/i18n/locale-provider';

export function ParallaxPromo() {
  const t = useTranslations();
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section ref={ref} className="relative py-20 sm:py-28 overflow-hidden">
      <div
        className="absolute inset-0 parallax-bg"
        style={{
          backgroundImage:
            'url("https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg")',
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 items-start lg:flex-row lg:items-center lg:justify-between">
          <div className={`max-w-3xl ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {t.promo.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">{t.promo.description}</p>
            <p className="mt-4 text-white/90 text-lg">
              {t.promo.priceFrom}{' '}
              <span className="text-white font-bold text-2xl">$159.00</span>
              <span className="text-white/70 text-sm ml-1">{t.promo.perPerson}</span>
            </p>
          </div>

          <div className={`shrink-0 ${isVisible ? 'animate-fade-in-right delay-200' : 'opacity-0'}`}>
            <a
              href="/hotels?destination=Kenya"
              className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-primary-hover hover:shadow-md"
            >
              {t.promo.details}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
