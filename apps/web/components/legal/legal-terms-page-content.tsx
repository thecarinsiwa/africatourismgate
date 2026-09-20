'use client';

import { useTranslations } from 'next-intl';
import { LegalDocumentPageContent } from './legal-document-page-content';

export function LegalTermsPageContent() {
  const t = useTranslations('legal');
  return (
    <LegalDocumentPageContent
      sectionKey="terms-of-use"
      fallbackTitle={t('termsOfUseTitle')}
      fallbackSubtitle={t('termsOfUseSubtitle')}
    />
  );
}
