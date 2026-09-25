import { assertCatalogProductEnabled } from '../../lib/catalog/products';

export default async function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertCatalogProductEnabled('packages');
  return children;
}
