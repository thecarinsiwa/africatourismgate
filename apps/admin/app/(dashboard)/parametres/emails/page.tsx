import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EmailBrandingPage } from '../../../../components/parametres/email-branding-page';

export const metadata: Metadata = {
  title: 'E-mails — Africa Tourism Gate Admin',
};

export default function ParametresEmailsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-atg-muted">Chargement…</p>}>
      <EmailBrandingPage />
    </Suspense>
  );
}
