import type { Metadata } from 'next';
import { LegalPrivacyPageContent } from '../../../components/legal/legal-privacy-page-content';
import { buildPrivacyPolicyMetadata } from '../../../lib/legal/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPrivacyPolicyMetadata();
}

export default function PrivacyPolicyPage() {
  return <LegalPrivacyPageContent />;
}
