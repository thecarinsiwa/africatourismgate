import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { ActivityProvidersList } from '../../../../../components/activities/activity-providers-list';

export const metadata: Metadata = {
  title: 'Fournisseurs d’activités — Africa Tourism Gate Admin',
};

export default function ActivitesFournisseursPage() {
  return (
    <div>
      <AdminPageIntro
        description="Opérateurs liés aux destinations."
        links={[{ href: '/produits/activites', label: '← Activités' }]}
      />
      <ActivityProvidersList />
    </div>
  );
}
