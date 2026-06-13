import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { UserForm } from '../../../../components/users/user-form';

export const metadata: Metadata = {
  title: 'Nouvel utilisateur — Africa Tourism Gate Admin',
};

export default function NouvelUtilisateurPage() {
  return (
    <div>
      <AdminPageIntro description={"Créer un compte utilisateur."} />
      <UserForm mode="create" />
    </div>
  );
}
