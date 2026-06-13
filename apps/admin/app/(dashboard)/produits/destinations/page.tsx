import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { DestinationsList } from '../../../../components/destinations/destinations-list';

export const metadata: Metadata = {
  title: 'Destinations — Africa Tourism Gate Admin',
};

export default function DestinationsPage() {
  return (
    <div>
      <AdminPageIntro description={"Géographie et points d’intérêt. Recherche par nom, slug ou code pays."} />
      <DestinationsList />
    </div>
  );
}
