import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { RentalAgenciesList } from '../../../../../components/locations/rental-agencies-list';

export const metadata: Metadata = {
  title: 'Agences de location — Africa Tourism Gate Admin',
};

export default function AgencesLocationPage() {
  return (
    <div>
      <AdminPageIntro description={"Référentiel des agences liées aux destinations."} />
      <RentalAgenciesList />
    </div>
  );
}
