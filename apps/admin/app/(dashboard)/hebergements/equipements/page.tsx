import type { Metadata } from 'next';
import { AmenitiesList } from '../../../../components/amenities/amenities-list';

export const metadata: Metadata = {
  title: 'Équipements — Africa Tourism Gate Admin',
};

export default function EquipementsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Équipements</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Catalogue global réutilisable sur les hébergements (Wi-Fi, piscine, etc.).
        </p>
      </div>
      <AmenitiesList />
    </div>
  );
}
