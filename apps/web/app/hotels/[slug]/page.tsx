import type { Metadata } from 'next';
import Link from 'next/link';
import { HomeFooter } from '../../../components/home/home-footer';
import { HomeHeader } from '../../../components/home/home-header';
import { fetchHotelBySlug } from '../../../lib/hotels/api';

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const hotel = await fetchHotelBySlug(params.slug);
  const title = hotel ? `${hotel.name} | Hotels` : 'Hotel Details';
  const description = hotel?.description ?? `Discover ${hotel?.name ?? 'this property'} and book your stay.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/hotels/${params.slug}`,
      languages: {
        fr: `/hotels/${params.slug}?lang=fr`,
        en: `/hotels/${params.slug}?lang=en`,
        es: `/hotels/${params.slug}?lang=es`,
      },
    },
  };
}

export default async function HotelDetailsPage({ params }: PageProps) {
  const hotel = await fetchHotelBySlug(params.slug);

  if (!hotel) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
        <HomeHeader />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-[#0f1a16] dark:text-white">Hotel not found</h1>
          <p className="mt-3 text-gray-500 dark:text-atg-muted">The requested property does not exist or is no longer available.</p>
          <Link href="/hotels" className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover">Back to hotels</Link>
        </main>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/hotels" className="text-sm font-medium text-primary hover:underline">? Back to hotels</Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-atg-border dark:bg-atg-elevated">
              <div className="relative h-72 sm:h-96">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${hotel.gallery[0] ?? hotel.image}")` }} />
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-[#0f1a16] dark:text-white">{hotel.name}</h1>
                <p className="mt-2 text-gray-500 dark:text-atg-muted">{hotel.location}, {hotel.country}</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-atg-muted">{hotel.description ?? 'Comfortable stay with curated local experiences and premium hospitality.'}</p>
                {hotel.addressLine && <p className="mt-3 text-sm text-gray-500 dark:text-atg-muted"><strong>Address:</strong> {hotel.addressLine}</p>}
              </div>
            </div>

            {hotel.gallery.length > 1 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {hotel.gallery.slice(1, 7).map((image, idx) => (
                  <div key={idx} className="h-28 rounded-xl bg-cover bg-center border border-gray-100 dark:border-atg-border" style={{ backgroundImage: `url("${image}")` }} />
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated">
              <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">Available rooms</h2>
              <div className="mt-4 space-y-3">
                {hotel.rooms.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-atg-muted">Room inventory will be available soon.</p>
                ) : (
                  hotel.rooms.map((room) => (
                    <div key={room.id} className="rounded-lg border border-gray-100 p-3 dark:border-atg-border">
                      <p className="font-semibold text-[#0f1a16] dark:text-white">{room.name}</p>
                      <p className="text-xs text-gray-500 dark:text-atg-muted">{room.roomType} · {room.maxGuests} guests · {room.bedConfig}</p>
                      <p className="mt-2 text-sm font-bold text-primary">{room.price} {room.currency} / night</p>
                      <Link href={`/booking?propertyId=${encodeURIComponent(hotel.id)}&roomId=${encodeURIComponent(room.id)}`} className="mt-2 inline-flex min-h-[40px] items-center rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-wide text-white hover:bg-primary-hover">Book this room</Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
      <HomeFooter />
    </div>
  );
}