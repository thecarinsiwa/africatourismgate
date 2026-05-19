import type { Metadata } from 'next';
import { UserForm } from '../../../../components/users/user-form';

export const metadata: Metadata = {
  title: 'Nouvel utilisateur — Africa Tourism Gate Admin',
};

export default function NouvelUtilisateurPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Nouvel utilisateur</h1>
        <p className="mt-2 text-sm text-atg-muted">Créer un compte utilisateur.</p>
      </div>
      <UserForm mode="create" />
    </div>
  );
}
