import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { RegisterPageContent } from '../../../components/auth/register-page-content';
import { AdminPageLoading } from '../../../components/pages/admin-page-loading';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <RegisterPageContent />
    </Suspense>
  );
}
