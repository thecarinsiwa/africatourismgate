import type { Metadata } from 'next';
import { AdminPageLoading } from '../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { Suspense } from 'react';
import { OrganizationBankAccountsList } from '../../../../components/parametres/organization-bank-accounts-list';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/comptes');
}

export default function ParametresComptesPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <OrganizationBankAccountsList />
    </Suspense>
  );
}
