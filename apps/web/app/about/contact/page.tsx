import type { Metadata } from 'next';
import { AboutContactPageContent } from '../../../components/about/about-contact-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';
import { ABOUT_PATHS } from '../../../lib/about/routes';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata(ABOUT_PATHS.contact, 'contact');
}

export default function Page() {
  return <AboutContactPageContent />;
}
