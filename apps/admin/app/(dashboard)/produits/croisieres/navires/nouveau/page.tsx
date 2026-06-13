import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../../components/admin-page-intro';
import { ShipForm } from '../../../../../../components/cruises/ship-form';

export const metadata: Metadata = {
  title: 'Nouveau navire — Africa Tourism Gate Admin',
};

export default function NouveauNavirePage() {
  return (
    <div>
      <AdminPageIntro description={"Créez un navire puis ajoutez itinéraires et cabines."} />
      <ShipForm mode="create" />
    </div>
  );
}
