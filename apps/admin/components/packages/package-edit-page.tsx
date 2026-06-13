'use client';

import type { Package, PackageDetail } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/produits/forfaits" className="text-sm font-medium text-primary">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { pkg } = state;

  return (
    <div>
      <p className="mb-8 text-sm text-atg-muted">
        {pkg.name}{' '}
        <span className="tabular-nums">(remise {pkg.discountPercent}%)</span>
      </p>
      <PackageForm mode="edit" packageId={packageId} initialPackage={pkg} />
      <PackageItemsSection packageId={packageId} />
    </div>
  );
}
