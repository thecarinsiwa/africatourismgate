import type { Metadata } from 'next';
import { AboutTeamPageContent } from '../../../components/about/about-team-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata('/a-propos/equipe', 'team');
}

export default function Page() {
  return <AboutTeamPageContent />;
}
