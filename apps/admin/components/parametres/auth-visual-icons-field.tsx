'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { AuthVisualDecorIcon } from '@africatourismgate/types';
import {
  AUTH_VISUAL_ICON_POSITIONS,
  AUTH_VISUAL_ICON_PRESETS,
  AUTH_VISUAL_ICON_SIZES,
  DEFAULT_AUTH_VISUAL_ICONS,
} from '@africatourismgate/types/organization-settings';
import {
  AUTH_VISUAL_POSITION_LABELS,
  AUTH_VISUAL_PRESET_LABELS,
  AUTH_VISUAL_SIZE_LABELS,
} from '../../lib/auth-visual';
import { AuthVisualDecorIcon as AuthVisualDecorIconPreview } from '../auth/auth-visual-decor-icon';

type Props = {
  icons: AuthVisualDecorIcon[];
  onChange: (icons: AuthVisualDecorIcon[]) => void;
  onUploadImage: (index: number, file: File) => Promise<string>;
  uploadingIndex: number | null;
};

const selectClass =
  'w-full rounded-lg border border-atg-border bg-atg-bg px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

function createDefaultIcon(): AuthVisualDecorIcon {
  return {
    preset: 'pin',
    opacity: 25,
    size: 'md',
    position: 'bottom-right',
    enabled: true,
  };
}

export function AuthVisualIconsField({
  icons,
  onChange,
  onUploadImage,
  uploadingIndex,
}: Props) {
  function updateIcon(index: number, patch: Partial<AuthVisualDecorIcon>) {
    onChange(
      icons.map((icon, currentIndex) =>
        currentIndex === index ? { ...icon, ...patch } : icon,
      ),
    );
  }

  function removeIcon(index: number) {
    onChange(icons.filter((_, currentIndex) => currentIndex !== index));
  }

  function addIcon() {
    if (icons.length >= 6) return;
    onChange([...icons, createDefaultIcon()]);
  }

  function resetDefaults() {
    onChange(DEFAULT_AUTH_VISUAL_ICONS.map((icon) => ({ ...icon })));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-atg-muted">
          Icônes décoratives affichées sur le panneau vert de connexion / inscription.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetDefaults}>
            Réinitialiser
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addIcon} disabled={icons.length >= 6}>
            Ajouter une icône
          </Button>
        </div>
      </div>

      {icons.length === 0 ? (
        <p className="rounded-lg border border-dashed border-atg-border px-4 py-6 text-sm text-atg-muted">
          Aucune icône configurée. Ajoutez-en une ou réinitialisez les valeurs par défaut.
        </p>
      ) : null}

      {icons.map((icon, index) => (
        <div
          key={`auth-visual-icon-${index}`}
          className="rounded-xl border border-atg-border bg-atg-elevated/40 p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-atg-fg">
              <input
                type="checkbox"
                checked={icon.enabled}
                onChange={(event) => updateIcon(index, { enabled: event.target.checked })}
                className="rounded border-atg-border"
              />
              Icône {index + 1}
            </label>
            <Button type="button" variant="outline" size="sm" onClick={() => removeIcon(index)}>
              Supprimer
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-atg-fg">Type</label>
              <select
                className={selectClass}
                value={icon.preset}
                onChange={(event) =>
                  updateIcon(index, {
                    preset: event.target.value as AuthVisualDecorIcon['preset'],
                    ...(event.target.value !== 'custom' ? { imageUrl: undefined } : {}),
                  })
                }
              >
                {AUTH_VISUAL_ICON_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {AUTH_VISUAL_PRESET_LABELS[preset]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-atg-fg">Position</label>
              <select
                className={selectClass}
                value={icon.position}
                onChange={(event) =>
                  updateIcon(index, {
                    position: event.target.value as AuthVisualDecorIcon['position'],
                  })
                }
              >
                {AUTH_VISUAL_ICON_POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {AUTH_VISUAL_POSITION_LABELS[position]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-atg-fg">Taille</label>
              <select
                className={selectClass}
                value={icon.size}
                onChange={(event) =>
                  updateIcon(index, {
                    size: event.target.value as AuthVisualDecorIcon['size'],
                  })
                }
              >
                {AUTH_VISUAL_ICON_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {AUTH_VISUAL_SIZE_LABELS[size]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-atg-fg">
                Opacité ({icon.opacity}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={icon.opacity}
                onChange={(event) =>
                  updateIcon(index, { opacity: Number(event.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>

          {icon.preset === 'custom' ? (
            <div className="mt-4 space-y-3">
              <Input
                label="URL de l'image"
                value={icon.imageUrl ?? ''}
                onChange={(event) => updateIcon(index, { imageUrl: event.target.value })}
                placeholder="https://..."
              />
              <label className="inline-flex cursor-pointer items-center rounded-md border border-atg-border px-3 py-2 text-xs font-medium text-atg-fg hover:bg-atg-muted/10">
                {uploadingIndex === index ? 'Upload en cours…' : 'Choisir une image locale'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingIndex !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void onUploadImage(index, file).then((url) => {
                      updateIcon(index, { imageUrl: url });
                    });
                    event.target.value = '';
                  }}
                />
              </label>
            </div>
          ) : null}

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-atg-muted">
              Aperçu
            </p>
            <div className="relative h-28 overflow-hidden rounded-lg bg-gradient-to-br from-primary via-[#0d5c44] to-secondary">
              <AuthVisualDecorIconPreview
                icon={{
                  ...icon,
                  imageUrl: icon.imageUrl ?? null,
                }}
                variant="full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
