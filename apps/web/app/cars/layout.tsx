import { assertCatalogProductEnabled } from '../../lib/catalog/products';

export default async function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertCatalogProductEnabled('cars');
  return children;
}
