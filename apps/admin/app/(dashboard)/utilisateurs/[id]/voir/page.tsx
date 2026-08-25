import type { Metadata } from 'next';
import { AdminPageLoading } from '../../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { UserViewPage } from '../../../../../components/users/user-view-page';

type PageProps = {
  params: { id: string };
};

const USER_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('utilisateurs/id/voir');
}

export default function ViewUtilisateurPage({ params }: PageProps) {
  if (!USER_ID_RE.test(params.id)) {
    notFound();
  }

  return (
    <Suspense fallback={<AdminPageLoading />}>
      <UserViewPage userId={params.id} />
    </Suspense>
  );
}
