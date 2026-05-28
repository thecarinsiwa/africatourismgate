import Link from 'next/link';
import { HomeFooter } from '../../components/home/home-footer';
import { HomeHeader } from '../../components/home/home-header';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pick(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

export default function BookingPage({ searchParams }: PageProps) {
  const propertyId = pick(searchParams.propertyId);
  const roomId = pick(searchParams.roomId);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-8">
          <h1 className="text-3xl font-bold text-[#0f1a16] dark:text-white">Booking Checkout</h1>
          <p className="mt-3 text-gray-600 dark:text-atg-muted">
            You are almost done. Confirm your stay details and continue to secure payment.
          </p>

          <div className="mt-6 space-y-2 rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <p className="text-sm text-gray-600 dark:text-atg-muted">
              Property ID: <span className="font-mono">{propertyId ?? 'N/A'}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-atg-muted">
              Room ID: <span className="font-mono">{roomId ?? 'N/A'}</span>
            </p>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-atg-muted">
            Full checkout integration is being finalized. Our team can still confirm your reservation manually.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:support@africatourismgate.com?subject=Booking%20request"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              Contact Booking Team
            </a>
            <Link
              href="/hotels"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80"
            >
              Back to hotels
            </Link>
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
