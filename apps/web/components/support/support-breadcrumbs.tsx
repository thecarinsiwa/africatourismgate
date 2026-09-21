'use client';

import { Breadcrumb, type BreadcrumbItem } from '@africatourismgate/ui';

type SupportBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function SupportBreadcrumbs({ items }: SupportBreadcrumbsProps) {
  return <Breadcrumb items={items} ariaLabel="Breadcrumb" className="mb-6" />;
}
