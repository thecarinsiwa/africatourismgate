import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { AirlinesList } from '../../../../../components/flights/airlines-list';

export const metadata: Metadata = {
  title: 'Compagnies aériennes — Africa Tourism Gate Admin',
};

export default function CompagniesPage() {
  return (
    <div>
      <AdminPageIntro description={"Référentiel des compagnies (code IATA 2 lettres)."} />
      <AirlinesList />
    </div>
  );
}
