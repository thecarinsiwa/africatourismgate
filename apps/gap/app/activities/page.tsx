import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { ActivitiesPreview } from '@/components/activities-preview';
import { listGapActivitiesForLocale } from '@/lib/api/public-gap';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('activities');
  return { title: t('title'), description: t('subtitle') };
}

export default async function ActivitiesPage() {
  const locale = await getLocale();
  const activities = await listGapActivitiesForLocale(locale).catch(() => []);
  return <ActivitiesPreview activities={activities} />;
}
