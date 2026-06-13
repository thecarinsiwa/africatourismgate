import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { CruiseLinesList } from '../../../../../components/cruises/cruise-lines-list';

export const metadata: Metadata = {
  title: 'Lignes de croisière — Africa Tourism Gate Admin',
};

export default function LignesCroisierePage() {
  return (
    <div>
      <AdminPageIntro
        description="Référentiel des compagnies / lignes."
        links={[{ href: '/produits/croisieres', label: '← Départs' }]}
      />
      <CruiseLinesList />
    </div>
  );
}
