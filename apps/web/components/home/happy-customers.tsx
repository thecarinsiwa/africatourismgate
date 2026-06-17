'use client';

import Image from 'next/image';
import { useScrollAnimation } from './use-scroll-animation';
import { useTranslations } from '../../lib/i18n/locale-provider';

const BAR_VALUES = [94, 87, 48, 51];

export function HappyCustomers() {
  const t = useTranslations();
  const { ref, isVisible } = useScrollAnimation(0.15);

  const bars = [
    { label: t.customers.bars.flights, value: BAR_VALUES[0], color: 'var(--atg-primary)' },
    { label: t.customers.bars.hotels, value: BAR_VALUES[1], color: 'var(--atg-secondary)' },
    { label: t.customers.bars.cars, value: BAR_VALUES[2], color: 'var(--atg-primary)' },
    { label: t.customers.bars.cruises, value: BAR_VALUES[3], color: 'var(--atg-secondary)' },
  ];

  return (
    <section ref={ref} className="overflow-hidden bg-atg-elevated py-16 transition-colors dark:bg-atg-surface sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className={`${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg"
                  alt={t.customers.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg sm:h-24 sm:w-24">
                <div className="text-center">
                  <span className="block text-2xl font-bold sm:text-3xl">10K+</span>
                  <span className="block text-[10px] font-medium uppercase tracking-wide">
                    {t.customers.clients}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl">
                {t.customers.title}
              </h2>
              <p className="mt-2 text-lg text-atg-muted">{t.customers.subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-atg-muted">{t.customers.p1}</p>
              <p className="mt-3 text-sm leading-relaxed text-atg-muted">{t.customers.p2}</p>
            </div>

            <div className="mt-8 space-y-5">
              {bars.map((bar, i) => (
                <div
                  key={bar.label}
                  className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-atg-fg">{bar.label}</span>
                    <span className="text-sm font-bold" style={{ color: bar.color }}>
                      {bar.value}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-atg-surface dark:bg-white/10">
                    <div
                      className={`h-full rounded-full ${isVisible ? 'progress-bar-fill' : ''}`}
                      style={{
                        width: isVisible ? `${bar.value}%` : '0%',
                        backgroundColor: bar.color,
                        animationDelay: `${(i + 1) * 150}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
