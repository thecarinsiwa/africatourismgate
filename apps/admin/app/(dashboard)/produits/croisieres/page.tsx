import type { Metadata } from 'next';
import Link from 'next/link';
import { SailingsList } from '../../../../components/cruises/sailings-list';

export const metadata: Metadata = {
  title: 'Croisières — Africa Tourism Gate Admin',
};

export default function CroisieresPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Croisières</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Départs programmés, itinéraires, cabines et disponibilités.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/produits/croisieres/lignes"
            className="font-medium text-primary hover:underline"
          >
            Lignes de croisière
          </Link>
          <span className="mx-2 text-atg-muted">·</span>
          <Link
            href="/produits/croisieres/ports"
            className="font-medium text-primary hover:underline"
          >
            Ports
          </Link>
          <span className="mx-2 text-atg-muted">·</span>
          <Link
            href="/produits/croisieres/navires"
            className="font-medium text-primary hover:underline"
          >
            Navires
          </Link>
        </p>
      </div>
      <SailingsList />
    </div>
  );
}
