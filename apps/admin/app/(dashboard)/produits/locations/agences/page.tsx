import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { AdminPageBackLink } from '../../../../../components/admin-page-back-link';
import { RentalAgenciesList } from '../../../../../components/locations/rental-agencies-list';

export const metadata: Metadata = {
  title: 'Agences de location — Africa Tourism Gate Admin',
};

export default function AgencesLocationPage() {
  return (
    <div>
      <PageHeader
        title="Agences de location"
        description="Référentiel des agences liées aux destinations."
        breadcrumb={
          <AdminPageBackLink href="/produits/locations" label="Retour aux véhicules" />
        }
      />
      <RentalAgenciesList />
    </div>
  );
}
