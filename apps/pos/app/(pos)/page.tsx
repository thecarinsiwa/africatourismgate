import type { Metadata } from 'next';
import { PosHomeActions } from '../../components/pos-home-actions';
import { posHomeConfig } from '../../config/home';

const { title, subtitle } = posHomeConfig;

export const metadata: Metadata = {
  title: 'Caisse — Africa Tourism Gate',
  description: 'Point de vente — accueil caisse',
};

export default function PosHomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-atg-fg md:text-4xl">{title}</h1>
        <p className="mt-2 text-lg text-atg-muted">{subtitle}</p>
      </div>

      <PosHomeActions />
    </div>
  );
}
