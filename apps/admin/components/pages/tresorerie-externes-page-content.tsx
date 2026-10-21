'use client';

import { ExternalCollaboratorsList } from '../treasury/external-collaborators-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function TresorerieExternesPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="tresorerie/externes" />
      <ExternalCollaboratorsList />
    </div>
  );
}
