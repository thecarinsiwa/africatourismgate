import type { Metadata } from 'next';
import Link from 'next/link';
import { CruisePortsList } from '../../../../../components/cruises/cruise-ports-list';

export const metadata: Metadata = {
  title: 'Ports de croisière — Africa Tourism Gate Admin',
};

export default function CroisieresPortsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Ports de croisière</h1>
        <p className="mt-2 text-sm text-atg-muted">Référentiel des escales.</p>
        <p className="mt-3 text-sm">
          <Link href="/produits/croisieres" className="font-medium text-primary hover:underline">
            ← Départs
          </Link>
        </p>
      </div>
      <CruisePortsList />
    </div>
  );
}
