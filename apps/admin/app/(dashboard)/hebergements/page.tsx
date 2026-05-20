import type { Metadata } from 'next';
import { PropertiesList } from '../../../components/properties/properties-list';

export const metadata: Metadata = {
  title: 'Hébergements — Africa Tourism Gate Admin',
};

export default function HebergementsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Hébergements</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Propriétés, chambres et équipements. Filtre par destination.
        </p>
      </div>
      <PropertiesList />
    </div>
  );
}
