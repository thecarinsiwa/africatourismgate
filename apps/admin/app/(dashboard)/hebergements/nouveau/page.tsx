import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { PropertyForm } from '../../../../components/properties/property-form';

export const metadata: Metadata = {
  title: 'Nouvel hébergement — Africa Tourism Gate Admin',
};

export default function NouvelHebergementPage() {
  return (
    <div>
      <AdminPageIntro description={"Créez la propriété puis ajoutez images, équipements et chambres."} />
      <PropertyForm mode="create" />
    </div>
  );
}
