import type { Metadata } from 'next';
import { ActivityForm } from '../../../../../components/activities/activity-form';

export const metadata: Metadata = {
  title: 'Nouvelle activité — Africa Tourism Gate Admin',
};

export default function NouvelleActivitePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouvelle activité</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Créez une expérience puis ajoutez des créneaux sur la page d’édition.
        </p>
      </div>
      <ActivityForm mode="create" />
    </div>
  );
}
