import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordPageContent } from '../../../components/auth/forgot-password-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.forgotPassword');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
