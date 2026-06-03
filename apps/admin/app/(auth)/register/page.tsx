import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RegisterPageContent } from '../../../components/auth/register-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.register');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function RegisterPage() {
  return <RegisterPageContent />;
}
