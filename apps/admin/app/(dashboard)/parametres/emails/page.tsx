import type { Metadata } from 'next';
import { AdminPageLoading } from '../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { Suspense } from 'react';
import { EmailBrandingPage } from '../../../../components/parametres/email-branding-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/emails');
}

export default function ParametresEmailsPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <EmailBrandingPage />
    </Suspense>
  );
}
