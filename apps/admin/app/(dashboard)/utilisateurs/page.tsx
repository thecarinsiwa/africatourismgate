import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { UsersList } from '../../../components/users/users-list';

export const metadata: Metadata = {
  title: 'Utilisateurs — Africa Tourism Gate Admin',
};

export default function UtilisateursPage() {
  return (
    <div>
      <AdminPageIntro description={"Comptes plateforme. Filtrez par statut ou organisation."} />
      <UsersList />
    </div>
  );
}
