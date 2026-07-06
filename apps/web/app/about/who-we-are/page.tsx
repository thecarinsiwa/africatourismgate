import type { Metadata } from 'next';
import { AboutTextPageContent } from '../../../components/about/about-text-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';
import { ABOUT_PATHS } from '../../../lib/about/routes';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata(ABOUT_PATHS.whoWeAre, 'whoWeAre');
}

export default function Page() {
  return <AboutTextPageContent sectionKey="who-we-are" />;
}
