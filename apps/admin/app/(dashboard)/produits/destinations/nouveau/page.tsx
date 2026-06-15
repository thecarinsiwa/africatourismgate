import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { DestinationForm } from '../../../../../components/destinations/destination-form';

export const metadata: Metadata = {
  title: 'Nouvelle destination — Africa Tourism Gate Admin',
};

export default function NouvelleDestinationPage() {
  return (
    <div>
      <PageHeader
        title="Nouvelle destination"
        description="Créez la destination puis ajoutez des points d'intérêt sur la page de modification."
      />
      <DestinationForm mode="create" showHeroPreview />
    </div>
  );
}
