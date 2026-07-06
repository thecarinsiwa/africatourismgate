import type { Metadata } from 'next';
import { AboutTextPageContent } from '../../../components/about/about-text-page-content';

export const metadata: Metadata = {
  title: 'Qui nous sommes',
  description:
    'Découvrez Africa Tourism Gate : notre mission, notre vision et notre engagement pour le tourisme en Afrique.',
  alternates: { canonical: '/a-propos/qui-nous-sommes' },
};

export default function Page() {
  return <AboutTextPageContent sectionKey="who-we-are" />;
}
