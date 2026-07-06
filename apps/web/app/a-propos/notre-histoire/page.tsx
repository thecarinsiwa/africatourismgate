import type { Metadata } from 'next';
import { AboutHistoryPageContent } from '../../../components/about/about-history-page-content';
import { buildAboutPageMetadata } from '../../../lib/about/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildAboutPageMetadata('/a-propos/notre-histoire', 'history');
}

export default function Page() {
  return <AboutHistoryPageContent />;
}
