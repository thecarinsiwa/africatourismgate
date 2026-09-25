import { assertCatalogProductEnabled } from '../../lib/catalog/products';

export default async function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertCatalogProductEnabled('tours');
  return children;
}
