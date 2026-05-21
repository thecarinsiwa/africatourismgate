import type { Metadata } from 'next';
import { ActivitiesList } from '../../../../components/activities/activities-list';

export const metadata: Metadata = {
  title: 'Activités — Africa Tourism Gate Admin',
};

export default function ActivitesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Activités</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Expériences, fournisseurs et créneaux par destination.
        </p>
      </div>
      <ActivitiesList />
    </div>
  );
}
