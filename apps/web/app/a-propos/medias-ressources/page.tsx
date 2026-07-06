import type { Metadata } from 'next';
import { AboutResourcesPageContent } from '../../../components/about/about-resources-page-content';

export const metadata: Metadata = {
  title: 'Médias & ressources',
  description: 'Kit presse et ressources médias Africa Tourism Gate.',
  alternates: { canonical: '/a-propos/medias-ressources' },
};

export default function Page() {
  return <AboutResourcesPageContent type="media" />;
}
