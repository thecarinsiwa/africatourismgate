import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GapPageContent } from '@/components/gap-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pages.unesco');
  return { title: t('title') };
}

export default async function UnescoPage() {
  const t = await getTranslations('pages.unesco');
  return <GapPageContent sectionKey="unesco" title={t('title')} />;
}
