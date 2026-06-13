import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { ActivityForm } from '../../../../../components/activities/activity-form';

export const metadata: Metadata = {
  title: 'Nouvelle activité — Africa Tourism Gate Admin',
};

export default function NouvelleActivitePage() {
  return (
    <div>
      <AdminPageIntro description={"Créez une expérience puis ajoutez des créneaux sur la page d’édition."} />
      <ActivityForm mode="create" />
    </div>
  );
}
