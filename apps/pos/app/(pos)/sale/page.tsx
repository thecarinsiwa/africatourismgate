import type { Metadata } from 'next';
import { PosSaleScreen } from '../../../components/sale/pos-sale-screen';
import { posSalePageConfig } from '../../../config/sale';

const { title, subtitle } = posSalePageConfig;

export const metadata: Metadata = {
  title: 'Nouvelle vente — Caisse ATG',
  description: 'Vente sur place',
};

export default function PosSalePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-atg-fg md:text-4xl">{title}</h1>
        <p className="mt-2 text-lg text-atg-muted">{subtitle}</p>
      </div>

      <PosSaleScreen />
    </div>
  );
}
