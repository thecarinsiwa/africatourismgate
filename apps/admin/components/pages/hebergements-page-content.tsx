'use client';

import { PropertiesList } from '../properties/properties-list';
import { PropertiesStatCards } from '../properties/properties-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function HebergementsPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="hebergements" />
      <PropertiesStatCards className="mb-6" />
      <PropertiesList />
    </div>
  );
}
