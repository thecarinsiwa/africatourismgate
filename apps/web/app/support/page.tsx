import type { Metadata } from 'next';
import { SupportPageContent } from '../../components/support/support-page-content';

export const metadata: Metadata = {
  title: 'Aide et support',
  description:
    'FAQ et contact support Africa Tourism Gate — réservations, paiements et compte client.',
};

export default function SupportPage() {
  return <SupportPageContent />;
}
