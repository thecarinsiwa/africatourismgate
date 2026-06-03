import type { Metadata } from 'next';
import { PosSaleScreen } from '../../../components/sale/pos-sale-screen';
import { posSalePageConfig } from '../../../config/sale';

const { title, subtitle } = posSalePageConfig;

export const metadata: Metadata = {
  title: 'Nouvelle vente',
  description: 'Vente sur place',
};

export default function PosSalePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-atg-fg md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-atg-muted md:text-base">{subtitle}</p>
      </header>

      <PosSaleScreen />
    </div>
  );
}
