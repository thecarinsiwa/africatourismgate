import type { Metadata } from 'next';
import { PosHomeActions } from '../../components/pos-home-actions';
import { PosHomeHero } from '../../components/pos-home-hero';

export const metadata: Metadata = {
  title: 'Caisse — Africa Tourism Gate',
  description: 'Point de vente — accueil caisse',
};

export default function PosHomePage() {
  return (
    <div className="flex flex-1 flex-col gap-8 md:gap-10">
      <PosHomeHero />
      <PosHomeActions />
    </div>
  );
}
