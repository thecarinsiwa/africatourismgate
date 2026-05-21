import type { Metadata } from 'next';
import { AirlinesList } from '../../../../../components/flights/airlines-list';

export const metadata: Metadata = {
  title: 'Compagnies aériennes — Africa Tourism Gate Admin',
};

export default function CompagniesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Compagnies aériennes</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Référentiel des compagnies (code IATA 2 lettres).
        </p>
      </div>
      <AirlinesList />
    </div>
  );
}
