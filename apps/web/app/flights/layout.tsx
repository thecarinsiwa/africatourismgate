import { assertCatalogProductEnabled } from '../../lib/catalog/products';

export default async function FlightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertCatalogProductEnabled('flights');
  return children;
}
