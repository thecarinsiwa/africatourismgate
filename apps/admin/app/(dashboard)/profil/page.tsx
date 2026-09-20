import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminProfilePage } from '../../../components/profil/admin-profile-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.profil');
  return {
    title: t('metaTitle'),
  };
}

export default function ProfilPage() {
  return <AdminProfilePage />;
}
