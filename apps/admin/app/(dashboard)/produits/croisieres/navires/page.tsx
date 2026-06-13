import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../../components/admin-page-intro';
import { ShipsList } from '../../../../../components/cruises/ships-list';

export const metadata: Metadata = {
  title: 'Navires — Africa Tourism Gate Admin',
};

export default function CroisieresNaviresPage() {
  return (
    <div>
      <AdminPageIntro description={"Navires, itinéraires, escales et cabines.\r\n        </p>\r\n        <p className=\"mt-3 text-sm\">\r\n          <Link href=\"/produits/croisieres\" className=\"font-medium text-primary hover:underline\">\r\n            ← Départs\r\n          </Link>"} />
      <ShipsList />
    </div>
  );
}
