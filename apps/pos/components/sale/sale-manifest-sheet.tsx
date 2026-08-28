'use client';

import type { BookingManifestSex } from '@africatourismgate/types';
import { Button, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import type { SaleCartCustomer, SaleManifestDraftEntry } from '../../lib/sale/types';
import { emptySaleManifestEntry } from '../../lib/sale/types';

const { manifest: labels } = posSalePageConfig;

type SaleManifestSheetProps = {
  open: boolean;
  entries: SaleManifestDraftEntry[];
  customer: SaleCartCustomer | null;
  expectedCount: number;
  onClose: () => void;
  onSave: (entries: SaleManifestDraftEntry[]) => void;
};

export function SaleManifestSheet({
  open,
  entries,
  customer,
  expectedCount,
  onClose,
  onSave,
}: SaleManifestSheetProps) {
  const [drafts, setDrafts] = useState<SaleManifestDraftEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    if (entries.length > 0) {
      setDrafts(entries.map((e) => ({ ...e })));
      return;
    }

    const count = Math.max(1, expectedCount);
    const initial: SaleManifestDraftEntry[] = Array.from({ length: count }, () =>
      emptySaleManifestEntry(),
    );

    if (customer) {
      const name = `${customer.firstName} ${customer.lastName}`.trim();
      if (name) {
        initial[0] = {
          ...initial[0]!,
          fullName: name,
        };
      }
    }

    setDrafts(initial);
  }, [open, entries, customer, expectedCount]);

  if (!open) {
    return null;
  }

  function updateEntry(index: number, patch: Partial<SaleManifestDraftEntry>) {
    setDrafts((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index]!, ...patch };
      return next;
    });
  }

  function addTraveler() {
    setDrafts((prev) => [...prev, emptySaleManifestEntry()]);
  }

  function removeTraveler(index: number) {
    setDrafts((prev) => {
      if (prev.length <= 1) {
        return [emptySaleManifestEntry()];
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function fillFromCustomer(index: number) {
    if (!customer) return;
    const name = `${customer.firstName} ${customer.lastName}`.trim();
    updateEntry(index, { fullName: name });
  }

  function handleSave() {
    // Ne garder que les entrées qui ont au moins le nom ou une info renseignée
    const filtered = drafts.filter(
      (e) =>
        e.fullName.trim() ||
        e.idNumber?.trim() ||
        e.nationality?.trim() ||
        e.conditions?.trim() ||
        e.comment?.trim(),
    );
    onSave(filtered);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-manifest-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[calc(100dvh-8px)] w-full max-w-xl flex-col rounded-t-2xl border border-atg-border bg-atg-elevated shadow-xl sm:max-h-[92vh] sm:rounded-2xl">
        <div className="border-b border-atg-border px-4 py-4 sm:px-5">
          <h2 id="sale-manifest-title" className="text-xl font-bold text-atg-fg">
            {labels.sheetTitle}
          </h2>
          <p className="mt-1 text-base text-atg-muted">{labels.sheetSubtitle}</p>
        </div>

        <div className="pos-touch flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5">
          {drafts.map((entry, index) => (
            <div
              key={index}
              className="rounded-xl border border-atg-border bg-atg-surface/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-atg-fg">
                  {labels.travelerHeading(index + 1)}
                </span>
                <div className="flex items-center gap-2">
                  {customer && index === 0 && !entry.fullName ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!min-h-0 px-2 py-1 text-xs text-primary hover:underline"
                      onClick={() => fillFromCustomer(index)}
                    >
                      {labels.fillFromCustomerLabel}
                    </Button>
                  ) : null}
                  {drafts.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!min-h-0 px-2 py-1 text-xs text-red-600 hover:bg-red-500/10"
                      onClick={() => removeTraveler(index)}
                    >
                      {labels.removeTravelerLabel}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  id={`manifest-name-${index}`}
                  label={labels.fullNameLabel}
                  placeholder={labels.fullNamePlaceholder}
                  value={entry.fullName}
                  onChange={(e) => updateEntry(index, { fullName: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id={`manifest-age-${index}`}
                    type="number"
                    min={0}
                    max={120}
                    label={labels.ageLabel}
                    placeholder={labels.agePlaceholder}
                    value={entry.age !== undefined ? String(entry.age) : ''}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value, 10);
                      updateEntry(index, { age: Number.isNaN(val) ? undefined : val });
                    }}
                  />

                  <div>
                    <label
                      htmlFor={`manifest-sex-${index}`}
                      className="mb-2 block text-sm font-medium text-atg-fg"
                    >
                      {labels.sexLabel}
                    </label>
                    <select
                      id={`manifest-sex-${index}`}
                      value={entry.sex ?? ''}
                      onChange={(e) =>
                        updateEntry(index, {
                          sex: (e.target.value || undefined) as BookingManifestSex | undefined,
                        })
                      }
                      className="w-full rounded-lg border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[3rem]"
                    >
                      <option value="">{labels.sexOptions.empty}</option>
                      <option value="M">{labels.sexOptions.M}</option>
                      <option value="F">{labels.sexOptions.F}</option>
                      <option value="other">{labels.sexOptions.other}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id={`manifest-nat-${index}`}
                    label={labels.nationalityLabel}
                    placeholder={labels.nationalityPlaceholder}
                    value={entry.nationality ?? ''}
                    onChange={(e) => updateEntry(index, { nationality: e.target.value })}
                  />

                  <Input
                    id={`manifest-id-${index}`}
                    label={labels.idNumberLabel}
                    placeholder={labels.idNumberPlaceholder}
                    value={entry.idNumber ?? ''}
                    onChange={(e) => updateEntry(index, { idNumber: e.target.value })}
                  />
                </div>

                <Input
                  id={`manifest-conditions-${index}`}
                  label={labels.conditionsLabel}
                  placeholder={labels.conditionsPlaceholder}
                  value={entry.conditions ?? ''}
                  onChange={(e) => updateEntry(index, { conditions: e.target.value })}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            className="min-h-[2.75rem]"
            onClick={addTraveler}
          >
            + {labels.addTravelerLabel}
          </Button>
        </div>

        <div className="flex gap-3 border-t border-atg-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 min-h-[3rem]"
            onClick={onClose}
          >
            {labels.closeLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1 min-h-[3rem]"
            onClick={handleSave}
          >
            {labels.saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
