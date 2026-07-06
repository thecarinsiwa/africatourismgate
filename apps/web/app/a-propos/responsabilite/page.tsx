import type { Metadata } from 'next';
import { AboutTextPageContent } from '../../../components/about/about-text-page-content';

export const metadata: Metadata = {
  title: 'Responsabilité',
  description: 'Nos engagements pour un tourisme durable et responsable en Afrique.',
  alternates: { canonical: '/a-propos/responsabilite' },
};

export default function Page() {
  return <AboutTextPageContent sectionKey="responsibility" />;
}
