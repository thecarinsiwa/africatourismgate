import { assertCatalogProductEnabled } from '../../lib/catalog/products';

export default async function CruisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertCatalogProductEnabled('cruises');
  return children;
}
