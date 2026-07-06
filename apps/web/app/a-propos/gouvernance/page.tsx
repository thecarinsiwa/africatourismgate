import type { Metadata } from 'next';
import { AboutTextPageContent } from '../../../components/about/about-text-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata('/a-propos/gouvernance', 'governance');
}

export default function Page() {
  return <AboutTextPageContent sectionKey="governance" />;
}
