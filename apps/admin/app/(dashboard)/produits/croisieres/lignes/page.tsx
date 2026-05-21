import type { Metadata } from 'next';
import Link from 'next/link';
import { CruiseLinesList } from '../../../../../components/cruises/cruise-lines-list';

export const metadata: Metadata = {
  title: 'Lignes de croisière — Africa Tourism Gate Admin',
};

export default function CroisieresLignesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Lignes de croisière</h1>
        <p className="mt-2 text-sm text-atg-muted">Référentiel des compagnies / lignes.</p>
        <p className="mt-3 text-sm">
          <Link href="/produits/croisieres" className="font-medium text-primary hover:underline">
            ← Départs
          </Link>
        </p>
      </div>
      <CruiseLinesList />
    </div>
  );
}
