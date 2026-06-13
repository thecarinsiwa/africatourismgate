import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { PropertiesList } from '../../../components/properties/properties-list';

export const metadata: Metadata = {
  title: 'Hébergements — Africa Tourism Gate Admin',
};

export default function HebergementsPage() {
  return (
    <div>
      <AdminPageIntro description="Propriétés, chambres et équipements. Filtre par destination." />
      <PropertiesList />
    </div>
  );
}
