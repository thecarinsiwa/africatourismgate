import type { Metadata } from 'next';
import { AboutHistoryPageContent } from '../../../components/about/about-history-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';
import { ABOUT_PATHS } from '../../../lib/about/routes';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata(ABOUT_PATHS.history, 'history');
}

export default function Page() {
  return <AboutHistoryPageContent />;
}
