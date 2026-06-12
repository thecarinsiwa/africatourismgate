import type { Metadata } from 'next';
import { UserSessionsList } from '../../../../components/users/user-sessions-list';

export const metadata: Metadata = {
  title: 'Sessions — Africa Tourism Gate Admin',
};

export default function UtilisateurSessionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Sessions</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Sessions actives. Révoquez une session pour déconnecter l&apos;utilisateur.
        </p>
      </div>
      <UserSessionsList />
    </div>
  );
}
