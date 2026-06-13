import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { PackagesList } from '../../../../components/packages/packages-list';

export const metadata: Metadata = {
  title: 'Forfaits — Africa Tourism Gate Admin',
};

export default function ForfaitsPage() {
  return (
    <div>
      <AdminPageIntro description={"Packages combinés avec remise et prix calculé à partir des produits inclus."} />
      <PackagesList />
    </div>
  );
}
