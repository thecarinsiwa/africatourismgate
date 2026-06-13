import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { CruiseLinesList } from '../../../../../components/cruises/cruise-lines-list';

export const metadata: Metadata = {
  title: 'Lignes de croisière — Africa Tourism Gate Admin',
};

export default function CroisieresLignesPage() {
  return (
    <div>
      <AdminPageIntro description={"Référentiel des compagnies / lignes.</p>\r\n        <p className=\"mt-3 text-sm\">\r\n          <Link href=\"/produits/croisieres\" className=\"font-medium text-primary hover:underline\">\r\n            ← Départs\r\n          </Link>"} />
      <CruiseLinesList />
    </div>
  );
}
