import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { SailingForm } from '../../../../../components/cruises/sailing-form';

export const metadata: Metadata = {
  title: 'Nouveau départ — Africa Tourism Gate Admin',
};

export default function NouveauDepartPage() {
  return (
    <div>
      <AdminPageIntro description={"Associez un itinéraire existant à une date de départ."} />
      <SailingForm mode="create" />
    </div>
  );
}
