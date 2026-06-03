import type { Metadata } from 'next';
import { PosHomePageContent } from '../../components/pos-home-page-content';

export const metadata: Metadata = {
  title: 'Caisse',
  description: 'Point de vente — accueil caisse',
};

export default function PosHomePage() {
  return <PosHomePageContent />;
}
