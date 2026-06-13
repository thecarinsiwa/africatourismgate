import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { ActivitiesList } from '../../../../components/activities/activities-list';

export const metadata: Metadata = {
  title: 'Activités — Africa Tourism Gate Admin',
};

export default function ActivitesPage() {
  return (
    <div>
      <AdminPageIntro description={"Expériences, fournisseurs et créneaux par destination."} />
      <ActivitiesList />
    </div>
  );
}
