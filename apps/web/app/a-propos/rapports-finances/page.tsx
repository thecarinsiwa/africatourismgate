import type { Metadata } from 'next';
import { AboutResourcesPageContent } from '../../../components/about/about-resources-page-content';

export const metadata: Metadata = {
  title: 'Rapports et finances',
  description: 'Rapports d’activité et documents financiers d’Africa Tourism Gate.',
  alternates: { canonical: '/a-propos/rapports-finances' },
};

export default function Page() {
  return <AboutResourcesPageContent type="financial" />;
}
