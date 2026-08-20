'use client';

import { Modal } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return Boolean(target.closest('[contenteditable="true"], input, textarea, select'));
}

function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex min-w-[1.5rem] items-center justify-center rounded-md border border-atg-border bg-atg-surface px-1.5 py-0.5 font-mono text-[11px] font-medium text-atg-fg shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

export function KeyboardShortcutsHelp() {
  const t = useTranslations('common.keyboardShortcuts');
  const [open, setOpen] = useState(false);
  const isMac = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  }, []);

  const paletteKeys = isMac ? ['⌘', 'K'] : ['Ctrl', 'K'];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const rows = [
    {
      id: 'palette',
      keys: paletteKeys,
      label: t('items.palette'),
    },
    {
      id: 'escape',
      keys: ['Esc'],
      label: t('items.escape'),
    },
    {
      id: 'help',
      keys: ['?'],
      label: t('items.help'),
    },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title={t('title')}
      description={t('description')}
      showClose
      closeAriaLabel={t('close')}
    >
      <div className="space-y-4 p-4">
        <p className="text-sm text-atg-muted">{t('description')}</p>
        <ul className="divide-y divide-atg-border/70 rounded-xl border border-atg-border">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <span className="text-atg-fg">{row.label}</span>
              <ShortcutKeys keys={row.keys} />
            </li>
          ))}
        </ul>
        <p className="text-xs text-atg-muted">{t('hint')}</p>
      </div>
    </Modal>
  );
}
