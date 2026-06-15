import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { AmenitiesList } from '../../../../components/amenities/amenities-list';

export const metadata: Metadata = {
  title: 'Équipements — Africa Tourism Gate Admin',
};

export default function EquipementsPage() {
  return (
    <div>
      <AdminPageIntro description={"Catalogue global réutilisable sur les hébergements (Wi-Fi, piscine, etc.)."} />
      <AmenitiesList />
    </div>
  );
}
