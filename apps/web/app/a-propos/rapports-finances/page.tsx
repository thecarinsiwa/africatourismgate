import type { Metadata } from 'next';
import { AboutResourcesPageContent } from '../../../components/about/about-resources-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata('/a-propos/rapports-finances', 'reports');
}

export default function Page() {
  return <AboutResourcesPageContent type="financial" />;
}
