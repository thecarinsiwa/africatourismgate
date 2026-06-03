import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginPageContent } from '../../../components/auth/login-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.login');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function LoginPage() {
  return <LoginPageContent />;
}
