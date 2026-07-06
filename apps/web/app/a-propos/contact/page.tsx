import type { Metadata } from 'next';
import { AboutContactPageContent } from '../../../components/about/about-contact-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata('/a-propos/contact', 'contact');
}

export default function Page() {
  return <AboutContactPageContent />;
}
