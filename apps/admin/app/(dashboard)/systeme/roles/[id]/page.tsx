import type { Metadata } from 'next';
import { RoleEditPage } from '../../../../../components/rbac/role-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier le rôle — Africa Tourism Gate Admin',
};

export default function EditRolePage({ params }: PageProps) {
  return <RoleEditPage roleId={params.id} />;
}
