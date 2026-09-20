'use client';

import { useTranslations } from '../../lib/i18n/locale-provider';
import { LegalDocumentPageContent } from './legal-document-page-content';

export function LegalPrivacyPageContent() {
  const legal = useTranslations().legal;
  return (
    <LegalDocumentPageContent
      sectionKey="privacy-policy"
      fallbackTitle={legal.privacyPolicyTitle}
      fallbackSubtitle={legal.privacyPolicySubtitle}
    />
  );
}
