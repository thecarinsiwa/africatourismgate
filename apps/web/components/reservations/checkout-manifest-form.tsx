'use client';

import type { BookingManifestSex, CreateBookingManifestEntryRequest } from '@africatourismgate/types';
import { useEffect, useId } from 'react';

export type ManifestEntryDraft = {
  fullName: string;
  age: string;
  sex: '' | BookingManifestSex;
  nationality: string;
  idNumber: string;
  conditions: string;
  file?: File;
};

export function emptyManifestEntryDraft(): ManifestEntryDraft {
  return { fullName: '', age: '', sex: '', nationality: '', idNumber: '', conditions: '', file: undefined };
}

export function manifestDraftToPayload(
  entry: ManifestEntryDraft,
  sortOrder: number,
): CreateBookingManifestEntryRequest {
  const age = Number.parseInt(entry.age, 10);
  return {
    fullName: entry.fullName.trim(),
    age: !Number.isNaN(age) && age >= 0 ? age : undefined,
    sex: entry.sex || undefined,
    nationality: entry.nationality.trim() || undefined,
    idNumber: entry.idNumber.trim() || undefined,
    conditions: entry.conditions.trim() || undefined,
    sortOrder,
  };
}

type Labels = {
  title: string;
  subtitle: string;
  travelerN: string;
  fullName: string;
  age: string;
  sex: string;
  sexUnspecified: string;
  sexM: string;
  sexF: string;
  sexOther: string;
  nationality: string;
  idNumber: string;
  conditions: string;
  conditionsPlaceholder: string;
  idDocument: string;
  idDocumentHint: string;
  idDocumentSelected: string;
  idDocumentRemove: string;
};

type Props = {
  count: number;
  entries: ManifestEntryDraft[];
  onChange: (entries: ManifestEntryDraft[]) => void;
  labels: Labels;
  validationErrors: Record<number, string>;
};

export function CheckoutManifestForm({ count, entries, onChange, labels, validationErrors }: Props) {
  const baseId = useId();

  useEffect(() => {
    if (entries.length === count) return;
    if (count < 1) return;
    const next = Array.from({ length: count }, (_, i) => entries[i] ?? emptyManifestEntryDraft());
    onChange(next);
  }, [count, entries, onChange]);

  function update(index: number, patch: Partial<ManifestEntryDraft>) {
    const next = entries.map((e, i) => (i === index ? { ...e, ...patch } : e));
    onChange(next);
  }

  if (entries.length === 0) return null;

  return (
    <div className="space-y-4 rounded-xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
      <div>
        <h3 className="text-base font-semibold text-atg-fg">{labels.title}</h3>
        <p className="mt-1 text-sm text-atg-muted">{labels.subtitle}</p>
      </div>

      {entries.map((entry, index) => {
        const idPrefix = `${baseId}-t${index}`;
        const label = labels.travelerN.replace('{n}', String(index + 1));
        const error = validationErrors[index];
        return (
          <fieldset
            key={index}
            className="space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border"
          >
            <legend className="px-1 text-sm font-semibold text-atg-fg">{label}</legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor={`${idPrefix}-name`}
                  className="block text-sm font-medium text-atg-fg"
                >
                  {labels.fullName}
                  <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id={`${idPrefix}-name`}
                  type="text"
                  value={entry.fullName}
                  onChange={(e) => update(index, { fullName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                  autoComplete="name"
                />
                {error ? (
                  <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {error}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor={`${idPrefix}-age`}
                  className="block text-sm font-medium text-atg-fg"
                >
                  {labels.age}
                </label>
                <input
                  id={`${idPrefix}-age`}
                  type="number"
                  min={0}
                  max={150}
                  value={entry.age}
                  onChange={(e) => update(index, { age: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                />
              </div>

              <div>
                <label
                  htmlFor={`${idPrefix}-sex`}
                  className="block text-sm font-medium text-atg-fg"
                >
                  {labels.sex}
                </label>
                <select
                  id={`${idPrefix}-sex`}
                  value={entry.sex}
                  onChange={(e) =>
                    update(index, { sex: e.target.value as ManifestEntryDraft['sex'] })
                  }
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                >
                  <option value="">{labels.sexUnspecified}</option>
                  <option value="M">{labels.sexM}</option>
                  <option value="F">{labels.sexF}</option>
                  <option value="other">{labels.sexOther}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${idPrefix}-nat`}
                  className="block text-sm font-medium text-atg-fg"
                >
                  {labels.nationality}
                </label>
                <input
                  id={`${idPrefix}-nat`}
                  type="text"
                  value={entry.nationality}
                  onChange={(e) => update(index, { nationality: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                />
              </div>

              <div>
                <label
                  htmlFor={`${idPrefix}-id`}
                  className="block text-sm font-medium text-atg-fg"
                >
                  {labels.idNumber}
                </label>
                <input
                  id={`${idPrefix}-id`}
                  type="text"
                  value={entry.idNumber}
                  onChange={(e) => update(index, { idNumber: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 font-mono text-sm text-atg-fg dark:border-atg-border"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor={`${idPrefix}-cond`}
                  className="block text-sm font-medium text-atg-fg"
                >
                  {labels.conditions}
                </label>
                <textarea
                  id={`${idPrefix}-cond`}
                  rows={2}
                  value={entry.conditions}
                  onChange={(e) => update(index, { conditions: e.target.value })}
                  placeholder={labels.conditionsPlaceholder}
                  className="mt-1 w-full rounded-lg border border-atg-border bg-transparent px-3 py-2 text-sm text-atg-fg dark:border-atg-border"
                />
              </div>

              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-atg-fg">{labels.idDocument}</p>
                <p className="mt-0.5 text-xs text-atg-muted">{labels.idDocumentHint}</p>
                {entry.file ? (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-atg-border bg-atg-surface px-3 py-2 dark:border-atg-border dark:bg-white/5">
                    <svg className="h-4 w-4 shrink-0 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" />
                    </svg>
                    <span className="flex-1 truncate text-sm text-atg-fg">{entry.file.name}</span>
                    <button
                      type="button"
                      onClick={() => update(index, { file: undefined })}
                      className="text-xs text-atg-muted hover:text-red-600 dark:hover:text-red-400"
                    >
                      {labels.idDocumentRemove}
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={`${idPrefix}-file`}
                    className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-atg-border px-3 py-3 text-sm text-atg-muted transition-colors hover:border-primary hover:text-primary dark:border-atg-border"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
                      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                    </svg>
                    {labels.idDocumentSelected}
                    <input
                      id={`${idPrefix}-file`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) update(index, { file: f });
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
