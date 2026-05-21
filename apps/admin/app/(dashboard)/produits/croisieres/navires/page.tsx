import type { Metadata } from 'next';
import Link from 'next/link';
import { ShipsList } from '../../../../../components/cruises/ships-list';

export const metadata: Metadata = {
  title: 'Navires — Africa Tourism Gate Admin',
};

export default function CroisieresNaviresPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Navires</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Navires, itinéraires, escales et cabines.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/produits/croisieres" className="font-medium text-primary hover:underline">
            ← Départs
          </Link>
        </p>
      </div>
      <ShipsList />
    </div>
  );
}
