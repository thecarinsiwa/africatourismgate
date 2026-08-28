import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NotificationsPageContent } from '../../../components/notifications/notifications-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.notifications');
  return {
    title: t('metaTitle'),
  };
}

export default function NotificationsPage() {
  return <NotificationsPageContent />;
}
