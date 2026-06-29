'use client';

import Link from 'next/link';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import type { SearchVertical } from '../../lib/search/route';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { buildVerticalListRoute } from '../../lib/search/route';
import {
  ListingPageBody,
} from '../shared/listing-patterns';
import { ProductCard } from '../shared/product-card';
import { PriceDisplay } from '../shared/price-display';

type VerticalResultItem = {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
};

export function VerticalSearchPage({
  vertical,
  destination,
  items,
}: {
  vertical: SearchVertical;
  destination?: string;
  items: VerticalResultItem[];
}) {
  const t = useTranslations();
  const vs = t.verticalSearch;
  const verticalLabel = vs.verticals[vertical];
  const listRoute = buildVerticalListRoute(vertical);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <section className="border-b border-atg-border bg-atg-elevated py-10 dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            ← {vs.backHome}
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-atg-fg">
            {verticalLabel} — {vs.resultsTitle}
          </h1>
          <p className="mt-2 text-atg-muted">
            {destination
              ? vs.forDestination.replace('{destination}', destination)
              : vs.exploreHint}
          </p>
        </div>
      </section>

      <ListingPageBody
        isEmpty={items.length === 0}
        empty={{
          title: vs.noResults,
          description: vs.noResultsHint,
          backHomeLabel: vs.backHome,
          modifySearchLabel: t.search.search,
          modifySearchHref: '/#search',
        }}
      >
        {items.map((item) => (
          <ProductCard
            key={item.id}
            image={
              <div className="absolute inset-0 bg-gradient-to-br from-[#1b1b2f] to-primary/70" />
            }
            title={
              <h2 className="text-lg font-bold text-atg-fg sm:text-xl">{item.title}</h2>
            }
            meta={<p className="text-sm text-atg-muted">{item.subtitle}</p>}
            price={<PriceDisplay amount={item.priceLabel} />}
            actions={
              <Link
                href={listRoute}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
              >
                {vs.continue}
              </Link>
            }
          />
        ))}
      </ListingPageBody>

      <HomeFooter />
    </div>
  );
}
