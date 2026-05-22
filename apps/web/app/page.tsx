import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeFooter } from '../components/home/home-footer';
import { HomeHeader } from '../components/home/home-header';
import { HeroSearch } from '../components/home/hero-search';
import { VerticalsSection } from '../components/home/verticals-section';

export const metadata: Metadata = {
  title: 'Réservez votre voyage en Afrique',
  description:
    'Comparez hôtels, vols et expériences en Afrique. Recherchez des hébergements et planifiez votre prochain séjour avec Africa Tourism Gate.',
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-atg-surface">
      <HomeHeader />
      <HeroSearch />

      <section className="border-b border-atg-border bg-primary/5 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-atg-elevated p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 shadow-sm border border-atg-border">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Offre du moment
              </p>
              <h2 className="mt-2 text-xl font-bold text-atg-fg sm:text-2xl">
                Économisez sur votre prochain séjour
              </h2>
              <p className="mt-2 text-sm text-atg-muted max-w-xl">
                Des hébergements sélectionnés au Kenya, en Tanzanie, au Rwanda et ailleurs — réservez
                en quelques clics.
              </p>
            </div>
            <Link
              href="/hotels"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              Voir les hébergements
            </Link>
          </div>
        </div>
      </section>

      <VerticalsSection />
      <HomeFooter />
    </div>
  );
}
