import type { Metadata } from 'next';
import { LegalTermsPageContent } from '../../../components/legal/legal-terms-page-content';
import { buildTermsOfUseMetadata } from '../../../lib/legal/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildTermsOfUseMetadata();
}

export default function TermsOfUsePage() {
  return <LegalTermsPageContent />;
}
