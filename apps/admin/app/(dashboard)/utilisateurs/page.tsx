import type { Metadata } from 'next';
import { UsersList } from '../../../components/users/users-list';

export const metadata: Metadata = {
  title: 'Utilisateurs — Africa Tourism Gate Admin',
};

export default function UtilisateursPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Utilisateurs</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Comptes plateforme. Filtrez par statut ou organisation.
        </p>
      </div>
      <UsersList />
    </div>
  );
}
