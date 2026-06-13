import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { VehiclesList } from '../../../../components/locations/vehicles-list';

export const metadata: Metadata = {
  title: 'Locations véhicules — Africa Tourism Gate Admin',
};

export default function LocationsPage() {
  return (
    <div>
      <AdminPageIntro description={"Véhicules par agence, catégories et créneaux de disponibilité.\r\n        </p>\r\n        <p className=\"mt-3 text-sm\">\r\n          <Link\r\n            href=\"/produits/locations/agences\"\r\n            className=\"font-medium text-primary hover:underline\"\r\n          >\r\n            Agences de location\r\n          </Link>\r\n          <span className=\"mx-2 text-atg-muted\">·</span>\r\n          <Link\r\n            href=\"/produits/locations/categories\"\r\n            className=\"font-medium text-primary hover:underline\"\r\n          >\r\n            Catégories\r\n          </Link>"} />
      <VehiclesList />
    </div>
  );
}
