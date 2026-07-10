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

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  return <RegisterPageContent oauthError={params.error} />;
}
