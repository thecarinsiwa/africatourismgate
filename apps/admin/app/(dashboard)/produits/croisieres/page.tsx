import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { SailingsList } from '../../../../components/cruises/sailings-list';

export const metadata: Metadata = {
  title: 'Croisières — Africa Tourism Gate Admin',
};

export default function CroisieresPage() {
  return (
    <div>
      <AdminPageIntro description={"Départs programmés, itinéraires, cabines et disponibilités.\r\n        </p>\r\n        <p className=\"mt-3 text-sm\">\r\n          <Link\r\n            href=\"/produits/croisieres/lignes\"\r\n            className=\"font-medium text-primary hover:underline\"\r\n          >\r\n            Lignes de croisière\r\n          </Link>\r\n          <span className=\"mx-2 text-atg-muted\">·</span>\r\n          <Link\r\n            href=\"/produits/croisieres/ports\"\r\n            className=\"font-medium text-primary hover:underline\"\r\n          >\r\n            Ports\r\n          </Link>\r\n          <span className=\"mx-2 text-atg-muted\">·</span>\r\n          <Link\r\n            href=\"/produits/croisieres/navires\"\r\n            className=\"font-medium text-primary hover:underline\"\r\n          >\r\n            Navires\r\n          </Link>"} />
      <SailingsList />
    </div>
  );
}
