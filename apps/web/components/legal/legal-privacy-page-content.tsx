'use client';

import { useTranslations } from 'next-intl';
import { LegalDocumentPageContent } from './legal-document-page-content';

export function LegalPrivacyPageContent() {
  const t = useTranslations('legal');
  return (
    <LegalDocumentPageContent
      sectionKey="privacy-policy"
      fallbackTitle={t('privacyPolicyTitle')}
      fallbackSubtitle={t('privacyPolicySubtitle')}
    />
  );
}
