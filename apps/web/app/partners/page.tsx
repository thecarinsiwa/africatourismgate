import type { Metadata } from 'next';
import { PartnersPageContent } from '../../components/partners/partners-page-content';
import { buildListingPageMetadata } from '../../lib/seo/metadata';

export function generateMetadata(): Promise<Metadata> {
  return buildListingPageMetadata('partners', '/partners');
}

export default function PartnersPage() {
  return <PartnersPageContent />;
}
