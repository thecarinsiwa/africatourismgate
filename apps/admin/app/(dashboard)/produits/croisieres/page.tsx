import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { SailingsList } from '../../../../components/cruises/sailings-list';

export const metadata: Metadata = {
  title: 'Croisières — Africa Tourism Gate Admin',
};

export default function CroisieresPage() {
  return (
    <div>
      <AdminPageIntro
        description="Départs programmés, itinéraires, cabines et disponibilités."
        links={[
          { href: '/produits/croisieres/lignes', label: 'Lignes de croisière' },
          { href: '/produits/croisieres/ports', label: 'Ports' },
          { href: '/produits/croisieres/navires', label: 'Navires' },
        ]}
      />
      <SailingsList />
    </div>
  );
}
