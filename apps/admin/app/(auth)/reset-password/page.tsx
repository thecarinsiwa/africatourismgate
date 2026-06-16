import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ResetPasswordPageContent } from '../../../components/auth/reset-password-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.resetPassword');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function ResetPasswordPage() {
  return <ResetPasswordPageContent />;
}
