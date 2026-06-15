import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { UsersList } from '../../../components/users/users-list';
import { UsersStatCards } from '../../../components/users/users-stat-cards';

export const metadata: Metadata = {
  title: 'Utilisateurs — Africa Tourism Gate Admin',
};

export default function UtilisateursPage() {
  return (
    <div>
      <AdminPageIntro description={"Comptes plateforme. Filtrez par statut ou organisation."} />
      <UsersStatCards className="mb-6" />
      <UsersList />
    </div>
  );
}
