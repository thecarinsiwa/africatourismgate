import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { LoginPageContent } from '../../../components/auth/login-page-content';
import { AdminPageLoading } from '../../../components/pages/admin-page-loading';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.login');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
