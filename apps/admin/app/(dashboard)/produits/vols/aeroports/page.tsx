import type { Metadata } from 'next';
import { AirportsList } from '../../../../../components/flights/airports-list';

export const metadata: Metadata = {
  title: 'Aéroports — Africa Tourism Gate Admin',
};

export default function AeroportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Aéroports</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Référentiel des aéroports (code IATA 3 lettres).
        </p>
      </div>
      <AirportsList />
    </div>
  );
}
