import type { Metadata } from 'next';
import { UserEditPage } from '../../../../components/users/user-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’utilisateur — Africa Tourism Gate Admin',
};

export default function EditUtilisateurPage({ params }: PageProps) {
  return <UserEditPage userId={params.id} />;
}
