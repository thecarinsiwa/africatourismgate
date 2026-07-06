import type { Metadata } from 'next';
import { AboutResourcesPageContent } from '../../../components/about/about-resources-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';
import { ABOUT_PATHS } from '../../../lib/about/routes';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata(ABOUT_PATHS.reports, 'reports');
}

export default function Page() {
  return <AboutResourcesPageContent type="financial" />;
}
