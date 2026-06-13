import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { CruisePortsList } from '../../../../../components/cruises/cruise-ports-list';

export const metadata: Metadata = {
  title: 'Ports de croisière — Africa Tourism Gate Admin',
};

export default function CroisieresPortsPage() {
  return (
    <div>
      <AdminPageIntro description={"Référentiel des escales.</p>\r\n        <p className=\"mt-3 text-sm\">\r\n          <Link href=\"/produits/croisieres\" className=\"font-medium text-primary hover:underline\">\r\n            ← Départs\r\n          </Link>"} />
      <CruisePortsList />
    </div>
  );
}
