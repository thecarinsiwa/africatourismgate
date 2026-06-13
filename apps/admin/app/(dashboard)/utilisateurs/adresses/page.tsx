import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { UserAddressesList } from '../../../../components/users/user-addresses-list';

export const metadata: Metadata = {
  title: 'Adresses — Africa Tourism Gate Admin',
};

export default function UtilisateurAdressesPage() {
  return (
    <div>
      <AdminPageIntro description={"Adresses enregistrées par les utilisateurs."} />
      <UserAddressesList />
    </div>
  );
}
