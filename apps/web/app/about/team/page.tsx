import type { Metadata } from 'next';
import { AboutTeamPageContent } from '../../../components/about/about-team-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';
import { ABOUT_PATHS } from '../../../lib/about/routes';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata(ABOUT_PATHS.team, 'team');
}

export default function Page() {
  return <AboutTeamPageContent />;
}
