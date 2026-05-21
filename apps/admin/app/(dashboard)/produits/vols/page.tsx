import type { Metadata } from 'next';
import Link from 'next/link';
import { FlightsList } from '../../../../components/flights/flights-list';

export const metadata: Metadata = {
  title: 'Vols — Africa Tourism Gate Admin',
};

export default function VolsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Vols</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Catalogue des vols, classes cabine et disponibilités. Recherche par code vol.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/produits/vols/compagnies" className="font-medium text-primary hover:underline">
            Compagnies aériennes
          </Link>
          <span className="mx-2 text-atg-muted">·</span>
          <Link href="/produits/vols/aeroports" className="font-medium text-primary hover:underline">
            Aéroports
          </Link>
        </p>
      </div>
      <FlightsList />
    </div>
  );
}
