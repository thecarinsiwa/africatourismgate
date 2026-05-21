'use client';

import type { Package } from '@africatourismgate/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getPackagesErrorMessage } from '../../lib/packages-errors';
import { PackageForm } from './package-form';
import { PackageItemsSection } from './package-items-section';

type PackageEditPageProps = {
  packageId: string;
};

export function PackageEditPage({ packageId }: PackageEditPageProps) {
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; pkg: Package }
  >({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getPackage(packageId)
      .then((detail) => {
        if (!cancelled) setState({ status: 'ready', pkg: detail.package });
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Modifier le forfait</h1>
        <p className="mt-2 text-sm text-atg-muted">
          {pkg.name}{' '}
          <span className="tabular-nums">(remise {pkg.discountPercent}%)</span>
        </p>
      </div>
      <PackageForm mode="edit" packageId={packageId} initialPackage={pkg} />
      <PackageItemsSection packageId={packageId} />
    </div>
  );
}
