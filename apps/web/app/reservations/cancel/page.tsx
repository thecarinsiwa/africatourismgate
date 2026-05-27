import Link from 'next/link';
import { HomeFooter } from '../../../components/home/home-footer';
import { HomeHeader } from '../../../components/home/home-header';

export default function ReservationCancelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-white p-6 dark:border-amber-900/40 dark:bg-atg-elevated">
          <h1 className="text-2xl font-bold text-[#0f1a16] dark:text-white">
            Paiement annule
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-atg-muted">
            Aucun debit n&apos;a ete confirme. Vous pouvez reprendre votre reservation quand vous
            voulez.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/booking/cart"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Revenir au panier
            </Link>
            <Link
              href="/hotels"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-atg-border dark:text-white/80 dark:hover:bg-white/5"
            >
              Continuer la recherche
            </Link>
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
