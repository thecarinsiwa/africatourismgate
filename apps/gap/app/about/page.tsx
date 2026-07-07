import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GapPageContent } from '@/components/gap-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.about');
  return { title: t('title') };
}

export default async function AboutPage() {
  const t = await getTranslations('pages.about');
  return <GapPageContent sectionKey="about" title={t('title')} />;
}
