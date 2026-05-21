import type { Metadata } from 'next';
import { PackageForm } from '../../../../../components/packages/package-form';

export const metadata: Metadata = {
  title: 'Nouveau forfait — Africa Tourism Gate Admin',
};

export default function NouveauForfaitPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouveau forfait</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Créez le forfait puis ajoutez des items sur la page d’édition.
        </p>
      </div>
      <PackageForm mode="create" />
    </div>
  );
}
