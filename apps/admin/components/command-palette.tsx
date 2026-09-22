'use client';

import { Input, Modal } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildAdminNavSearchItems,
  matchesAdminNavSearchItem,
} from '../lib/admin-search';
import { usePermissions } from '../lib/auth/use-permissions';

export function CommandPalette() {
  const router = useRouter();
  const t = useTranslations('common.commandPalette');
  const tNav = useTranslations('nav');
  const { permissions, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const allItems = useMemo(
    () =>
      buildAdminNavSearchItems(
        (key) => tNav(key as Parameters<typeof tNav>[0]),
        { permissions, isSuperAdmin },
        { permissionsLoading },
      ),
    [tNav, permissions, isSuperAdmin, permissionsLoading],
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allItems;
    return allItems.filter((item) =>
      matchesAdminNavSearchItem(item, normalized),
    );
  }, [allItems, query]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (filteredItems.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % filteredItems.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + filteredItems.length) % filteredItems.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = filteredItems[activeIndex];
      if (item) navigate(item.href);
    }
  }

  return (
    <Modal open={open} onOpenChange={setOpen} title={t('title')} showClose>
      <div className="space-y-3 p-4" onKeyDown={handleListKeyDown}>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('placeholder')}
          autoFocus
          aria-label={t('placeholder')}
        />
        <p className="text-xs text-atg-muted">{t('shortcutHint')}</p>
        <ul className="max-h-72 overflow-y-auto rounded-lg border border-atg-border" role="listbox">
          {filteredItems.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-atg-muted">{t('empty')}</li>
          ) : (
            filteredItems.map((item, index) => (
              <li key={item.href}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    index === activeIndex
                      ? 'flex w-full flex-col gap-0.5 bg-atg-surface px-4 py-3 text-left'
                      : 'flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-atg-surface/70'
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigate(item.href)}
                >
                  <span className="text-sm font-medium text-atg-fg">{item.label}</span>
                  <span className="text-xs text-atg-muted">{item.href}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </Modal>
  );
}
