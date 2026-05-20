import type { Metadata } from 'next';
import { PropertyForm } from '../../../../components/properties/property-form';

export const metadata: Metadata = {
  title: 'Nouvel hébergement — Africa Tourism Gate Admin',
};

export default function NouvelHebergementPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouvel hébergement</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Créez la propriété puis ajoutez images, équipements et chambres.
        </p>
      </div>
      <PropertyForm mode="create" />
    </div>
  );
}
