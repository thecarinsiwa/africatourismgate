import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { UserSessionsList } from '../../../../components/users/user-sessions-list';

export const metadata: Metadata = {
  title: 'Sessions — Africa Tourism Gate Admin',
};

export default function UtilisateurSessionsPage() {
  return (
    <div>
      <AdminPageIntro description={"Sessions actives. Révoquez une session pour déconnecter l&apos;utilisateur."} />
      <UserSessionsList />
    </div>
  );
}
