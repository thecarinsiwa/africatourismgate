import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { PackageForm } from '../../../../../components/packages/package-form';

export const metadata: Metadata = {
  title: 'Nouveau forfait — Africa Tourism Gate Admin',
};

export default function NouveauForfaitPage() {
  return (
    <div>
      <AdminPageIntro description={"Créez le forfait puis ajoutez des items sur la page d’édition."} />
      <PackageForm mode="create" />
    </div>
  );
}
