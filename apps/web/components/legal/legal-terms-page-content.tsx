'use client';

import { useTranslations } from '../../lib/i18n/locale-provider';
import { LegalDocumentPageContent } from './legal-document-page-content';

export function LegalTermsPageContent() {
  const legal = useTranslations().legal;
  return (
    <LegalDocumentPageContent
      sectionKey="terms-of-use"
      fallbackTitle={legal.termsOfUseTitle}
      fallbackSubtitle={legal.termsOfUseSubtitle}
    />
  );
}
