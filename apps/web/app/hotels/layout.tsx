import { assertCatalogProductEnabled } from '../../lib/catalog/products';

export default async function HotelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertCatalogProductEnabled('hotels');
  return children;
}
