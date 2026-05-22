import type { Metadata } from 'next';
import { RentalAgenciesList } from '../../../../../components/locations/rental-agencies-list';

export const metadata: Metadata = {
  title: 'Agences de location — Africa Tourism Gate Admin',
};

export default function AgencesLocationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Agences de location</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Référentiel des agences liées aux destinations.
        </p>
      </div>
      <RentalAgenciesList />
    </div>
  );
}
