import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { FlightsList } from '../../../../components/flights/flights-list';

export const metadata: Metadata = {
  title: 'Vols — Africa Tourism Gate Admin',
};

export default function VolsPage() {
  return (
    <div>
      <AdminPageIntro description={"Catalogue des vols, classes cabine et disponibilités. Recherche par code vol.\r\n        </p>\r\n        <p className=\"mt-3 text-sm\">\r\n          <Link href=\"/produits/vols/compagnies\" className=\"font-medium text-primary hover:underline\">\r\n            Compagnies aériennes\r\n          </Link>\r\n          <span className=\"mx-2 text-atg-muted\">·</span>\r\n          <Link href=\"/produits/vols/aeroports\" className=\"font-medium text-primary hover:underline\">\r\n            Aéroports\r\n          </Link>"} />
      <FlightsList />
    </div>
  );
}
