import type { Metadata } from 'next';
import Link from 'next/link';
import { ActivityProvidersList } from '../../../../../components/activities/activity-providers-list';

export const metadata: Metadata = {
  title: 'Fournisseurs d’activités — Africa Tourism Gate Admin',
};

export default function ActivitesFournisseursPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Fournisseurs d’activités</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Opérateurs liés aux destinations.{' '}
          <Link href="/produits/activites" className="font-medium text-primary hover:underline">
            ← Activités
          </Link>
        </p>
      </div>
      <ActivityProvidersList />
    </div>
  );
}
