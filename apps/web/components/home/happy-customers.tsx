'use client';

import Image from 'next/image';
import { useScrollAnimation } from './use-scroll-animation';

const SATISFACTION_BARS = [
  { label: 'Vols', value: 94, color: '#0B6E4F' },
  { label: 'Hôtels', value: 87, color: '#199a45' },
  { label: 'Voitures', value: 48, color: '#0B6E4F' },
  { label: 'Croisières', value: 51, color: '#199a45' },
];

export function HappyCustomers() {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section ref={ref} className="bg-white py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left — Image */}
          <div className={`${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg/1280px-A_giraffe_with_a_beautiful_background_of_Nairobi_City_Skyline_%28cropped%29.jpg"
                  alt="Voyageurs heureux en Afrique"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              {/* Decorative badge */}
              <div className="absolute -bottom-4 -right-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0B6E4F] text-white shadow-lg sm:h-24 sm:w-24">
                <div className="text-center">
                  <span className="block text-2xl font-bold sm:text-3xl">10K+</span>
                  <span className="block text-[10px] font-medium uppercase tracking-wide">Clients</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1a16] uppercase tracking-wide">
                Clients Satisfaits
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                La satisfaction de nos voyageurs est notre priorité absolue.
              </p>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                Depuis notre lancement, nous avons accompagné des milliers de voyageurs dans la découverte de l&apos;Afrique. Notre engagement envers un service d&apos;excellence et des expériences authentiques nous a valu la confiance de notre communauté grandissante.
              </p>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                Chaque retour positif nous motive à continuer d&apos;améliorer nos services et à proposer des voyages toujours plus mémorables à travers le continent.
              </p>
            </div>

            {/* Progress bars */}
            <div className="mt-8 space-y-5">
              {SATISFACTION_BARS.map((bar, i) => (
                <div
                  key={bar.label}
                  className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0f1a16]">{bar.label}</span>
                    <span className="text-sm font-bold" style={{ color: bar.color }}>
                      {bar.value}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
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
