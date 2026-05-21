import type { Metadata } from 'next';
import { PackagesList } from '../../../../components/packages/packages-list';

export const metadata: Metadata = {
  title: 'Forfaits — Africa Tourism Gate Admin',
};

export default function ForfaitsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Forfaits</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Packages combinés avec remise et prix calculé à partir des produits inclus.
        </p>
      </div>
      <PackagesList />
    </div>
  );
}
