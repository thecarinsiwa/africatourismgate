'use client';

import type { Package, PackageDetail } from '@africatourismgate/types';
import { DataTableBadge, Skeleton } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getPackagesErrorMessage } from '../../lib/packages-errors';
import { PackageForm } from './package-form';
import { PackageItemsSection } from './package-items-section';

type PackageEditPageProps = {
  packageId: string;
};

function resolvePackageFromDetail(detail: PackageDetail | Package): Package | null {
  if ('package' in detail && detail.package) {
    return detail.package;
  }
  if ('name' in detail && typeof detail.name === 'string') {
    return detail;
  }
  return null;
}

export function PackageEditPage({ packageId }: PackageEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; pkg: Package }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Modifier le forfait',
    entityLabel: state.status === 'ready' ? state.pkg.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getPackage(packageId)
      .then((detail) => {
        const pkg = resolvePackageFromDetail(detail);
        if (!cancelled) {
          if (!pkg) {
            setState({ status: 'error', message: 'Réponse forfait invalide.' });
            return;
          }
          setState({ status: 'ready', pkg });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', message: getPackagesErrorMessage(error) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [packageId]);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/produits/forfaits" label="Retour aux forfaits" />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </div>
    );
  }

  const { pkg } = state;
  const discount = Number(pkg.discountPercent);

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/produits/forfaits" label="Retour aux forfaits" />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-atg-fg">{pkg.name}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <DataTableBadge variant={discount > 0 ? 'success' : 'muted'}>
            Remise {pkg.discountPercent}%
          </DataTableBadge>
          <DataTableBadge variant={pkg.active === 1 ? 'success' : 'muted'}>
            {pkg.active === 1 ? 'Actif' : 'Inactif'}
          </DataTableBadge>
          <DataTableBadge variant="muted">
            {pkg.durationDays} jour{pkg.durationDays > 1 ? 's' : ''}
          </DataTableBadge>
        </div>
      </div>

      <PackageForm mode="edit" packageId={packageId} initialPackage={pkg} />
      <PackageItemsSection packageId={packageId} />
    </div>
  );
}
