'use client';

import { useScrollAnimation } from './use-scroll-animation';

export function ParallaxPromo() {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Parallax background */}
      <div
        className="absolute inset-0 parallax-bg"
        style={{
          backgroundImage:
            'url("https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg")',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 items-start lg:flex-row lg:items-center lg:justify-between">
          {/* Text */}
          <div className={`max-w-3xl ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Safari au Kenya — Forfait Vacances
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed max-w-2xl">
              Découvrez les plaines infinies du Masai Mara, observez les Big Five dans leur habitat naturel et profitez d&apos;hébergements de luxe au cœur de la savane. Une expérience qui changera votre vision de l&apos;Afrique.
            </p>
            <p className="mt-4 text-white/90 text-lg">
              À partir de : <span className="text-white font-bold text-2xl">$159.00</span>
              <span className="text-white/70 text-sm ml-1">/personne</span>
            </p>
          </div>

          {/* CTA button */}
          <div className={`shrink-0 ${isVisible ? 'animate-fade-in-right delay-200' : 'opacity-0'}`}>
            <a
              href="/hotels?destination=Kenya"
              className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-[#0B6E4F] px-8 py-3 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#095a40] transition-colors shadow-lg hover:shadow-xl"
            >
              Détails
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
