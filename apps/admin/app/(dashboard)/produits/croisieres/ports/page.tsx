import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { CruisePortsList } from '../../../../../components/cruises/cruise-ports-list';

export const metadata: Metadata = {
  title: 'Ports de croisière — Africa Tourism Gate Admin',
};

export default function CroisieresPortsPage() {
  return (
    <div>
      <AdminPageIntro
        description="Référentiel des escales."
        links={[{ href: '/produits/croisieres', label: '← Départs' }]}
      />
      <CruisePortsList />
    </div>
  );
}
