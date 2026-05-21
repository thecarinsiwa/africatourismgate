'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { CreatePackageRequest, Package } from '@africatourismgate/types';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getPackagesErrorMessage } from '../../lib/packages-errors';

export type PackageFormValues = {
  name: string;
  description: string;
  discountPercent: string;
  active: boolean;
};

const defaultValues: PackageFormValues = {
  name: '',
  description: '',
  discountPercent: '0',
  active: true,
};

function packageToFormValues(pkg: Package): PackageFormValues {
  return {
    name: pkg.name,
    description: pkg.description ?? '',
    discountPercent: String(pkg.discountPercent),
    active: pkg.active === 1,
  };
}

function toPayload(values: PackageFormValues): CreatePackageRequest {
  return {
    name: values.name.trim(),
    discountPercent: Number(values.discountPercent),
    active: values.active,
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
  };
}

type PackageFormProps = {
  mode: 'create' | 'edit';
  packageId?: string;
  initialPackage?: Package;
};

export function PackageForm({ mode, packageId, initialPackage }: PackageFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<PackageFormValues>(() =>
    initialPackage ? packageToFormValues(initialPackage) : defaultValues,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof PackageFormValues>(key: K, value: PackageFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  function validate(): boolean {
    if (!values.name.trim()) {
      setFormError('Le nom est obligatoire.');
      return false;
    }
    const discount = Number(values.discountPercent);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      setFormError('La remise doit être entre 0 et 100.');
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body = toPayload(values);
      if (mode === 'create') {
        const created = await getApiClient().createPackage(body);
        router.push(`/produits/forfaits/${created.id}`);
      } else if (packageId) {
        await getApiClient().updatePackage(packageId, body);
        router.refresh();
      }
    } catch (error) {
      setFormError(getPackagesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}
      <Input
        label="Nom du forfait"
        value={values.name}
        onChange={(e) => updateField('name', e.target.value)}
      />
      <div>
        <label className="mb-2 block text-sm font-medium text-atg-fg">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className={selectClass}
        />
      </div>
      <Input
        label="Remise (%)"
        type="number"
        min={0}
        max={100}
        step={0.01}
        value={values.discountPercent}
        onChange={(e) => updateField('discountPercent', e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-atg-fg">
        <input
          type="checkbox"
          checked={values.active}
          onChange={(e) => updateField('active', e.target.checked)}
          className="rounded border-atg-border"
        />
        Forfait actif
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          {mode === 'create' ? 'Créer' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" href="/produits/forfaits">
          Annuler
        </Button>
      </div>
    </form>
  );
}
