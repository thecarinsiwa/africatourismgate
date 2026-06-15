import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { CruisesStatCards } from '../../../../../components/cruises/cruises-stat-cards';
import { ShipsList } from '../../../../../components/cruises/ships-list';

export const metadata: Metadata = {
  title: 'Navires — Africa Tourism Gate Admin',
};

export default function CroisieresNaviresPage() {
  return (
    <div>
      <AdminPageIntro
        description="Navires, itinéraires, escales et cabines."
        links={[{ href: '/produits/croisieres', label: '← Départs' }]}
      />
      <CruisesStatCards className="mb-6" />
      <ShipsList />
    </div>
  );
}
