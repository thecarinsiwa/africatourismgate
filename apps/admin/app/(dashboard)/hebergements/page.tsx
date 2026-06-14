import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { PropertiesList } from '../../../components/properties/properties-list';

export const metadata: Metadata = {
  title: 'Hébergements — Africa Tourism Gate Admin',
};

export default function HebergementsPage() {
  return (
    <div>
      <PageHeader
        title="Hébergements"
        description="Propriétés, chambres et équipements. Filtrez par destination."
      />
      <PropertiesList />
    </div>
  );
}
