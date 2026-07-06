import type { Metadata } from 'next';
import { AboutTextPageContent } from '../../../components/about/about-text-page-content';

export const metadata: Metadata = {
  title: 'Notre gouvernance',
  description: 'Structure de gouvernance et transparence d’Africa Tourism Gate.',
  alternates: { canonical: '/a-propos/gouvernance' },
};

export default function Page() {
  return <AboutTextPageContent sectionKey="governance" />;
}
