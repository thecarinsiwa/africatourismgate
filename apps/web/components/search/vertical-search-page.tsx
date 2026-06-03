import Link from 'next/link';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import type { SearchVertical } from '../../lib/search/route';

type VerticalResultItem = {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
};

const TITLES: Record<SearchVertical, string> = {
  hotels: 'Hotels',
  flights: 'Flights',
  cars: 'Car Rentals',
  cruises: 'Cruises',
  tours: 'Tours & Activities',
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
  const title = TITLES[vertical];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <section className="border-b border-gray-200 bg-white py-10 dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">? Back to home</Link>
          <h1 className="mt-3 text-3xl font-bold text-[#0f1a16] dark:text-white">{title} Results</h1>
          <p className="mt-2 text-gray-500 dark:text-atg-muted">
            {destination ? `Showing ${title.toLowerCase()} for ${destination}.` : `Explore available ${title.toLowerCase()} options.`}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-gray-600 dark:text-atg-muted">No results found yet for this search.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">{item.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-atg-muted">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{item.priceLabel}</p>
                    <Link href="/coming-soon" className="mt-2 inline-flex min-h-[40px] items-center rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-wide text-white hover:bg-primary-hover">Continue</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}