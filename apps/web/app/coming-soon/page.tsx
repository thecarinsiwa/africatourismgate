import type { Metadata } from 'next';
import { ComingSoonPage } from '../../components/coming-soon-page';

export const metadata: Metadata = {
  title: 'Coming Soon',
  description: 'Africa Tourism Gate — site en cours de mise à jour.',
  robots: { index: false, follow: false },
};

export default function ComingSoonRoute() {
  return <ComingSoonPage />;
}
