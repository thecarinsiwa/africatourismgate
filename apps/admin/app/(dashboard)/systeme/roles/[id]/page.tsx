import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { RoleEditPage } from '../../../../../components/rbac/role-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('systeme/roles/id');
}

export default function EditRolePage({ params }: PageProps) {
  return <RoleEditPage roleId={params.id} />;
}
