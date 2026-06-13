import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { DestinationForm } from '../../../../../components/destinations/destination-form';

export const metadata: Metadata = {
  title: 'Nouvelle destination — Africa Tourism Gate Admin',
};

export default function NouvelleDestinationPage() {
  return (
    <div>
      <AdminPageIntro description={"Créez la destination puis ajoutez des points d’intérêt sur la page de modification."} />
      <DestinationForm mode="create" />
    </div>
  );
}
