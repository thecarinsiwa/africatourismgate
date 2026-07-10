import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterPendingPageContent } from '../../../../components/auth/register-pending-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register.pending');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function RegisterPendingPage() {
  return <RegisterPendingPageContent />;
}
