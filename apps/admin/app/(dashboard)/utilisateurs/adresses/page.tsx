import type { Metadata } from 'next';
import { UserAddressesList } from '../../../../components/users/user-addresses-list';

export const metadata: Metadata = {
  title: 'Adresses — Africa Tourism Gate Admin',
};

export default function UtilisateurAdressesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Adresses</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Adresses enregistrées par les utilisateurs.
        </p>
      </div>
      <UserAddressesList />
    </div>
  );
}
