import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { AirportsList } from '../../../../../components/flights/airports-list';

export const metadata: Metadata = {
  title: 'Aéroports — Africa Tourism Gate Admin',
};

export default function AeroportsPage() {
  return (
    <div>
      <AdminPageIntro description={"Référentiel des aéroports (code IATA 3 lettres)."} />
      <AirportsList />
    </div>
  );
}
