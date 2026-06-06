import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UserEditPage } from '../../../../components/users/user-edit-page';

type PageProps = {
  params: { id: string };
};

const USER_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const metadata: Metadata = {
  title: 'Modifier l’utilisateur — Africa Tourism Gate Admin',
};

export default function EditUtilisateurPage({ params }: PageProps) {
  if (!USER_ID_RE.test(params.id)) {
    notFound();
  }

  return <UserEditPage userId={params.id} />;
}
