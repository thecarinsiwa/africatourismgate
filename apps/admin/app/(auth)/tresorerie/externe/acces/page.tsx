import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ExternalExpenseRequestPageContent } from '../../../../../components/treasury/external-expense-request-page-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('modules.treasury.externalAccess');
  return {
    title: t('metaTitle'),
    description: t('subtitle'),
  };
}

export default function TresorerieExterneAccesPage() {
  return <ExternalExpenseRequestPageContent />;
}
