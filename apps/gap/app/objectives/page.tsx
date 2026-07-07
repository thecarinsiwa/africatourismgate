import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GapPageContent } from '@/components/gap-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.objectives');
  return { title: t('title') };
}

export default async function ObjectivesPage() {
  const t = await getTranslations('pages.objectives');
  return <GapPageContent sectionKey="objectives" title={t('title')} />;
}
