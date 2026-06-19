'use client';

import { cn } from '@africatourismgate/ui';
import { useCallback, useId, useRef, useState } from 'react';

export type AccordionItem = {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  /** When false, opening one item closes the others. Default: false. */
  allowMultiple?: boolean;
  className?: string;
};

export function Accordion({
  items,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const isOpen = useCallback((id: string) => openIds.has(id), [openIds]);

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (allowMultiple) {
          next.add(id);
        } else {
          return new Set([id]);
        }
        return next;
      });
    },
    [allowMultiple],
  );

  function handleTriggerKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const { key } = event;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const delta = key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (index + delta + items.length) % items.length;
      triggerRefs.current.get(items[nextIndex]!.id)?.focus();
      return;
    }
    if (key === 'Home') {
      event.preventDefault();
      triggerRefs.current.get(items[0]!.id)?.focus();
      return;
    }
    if (key === 'End') {
      event.preventDefault();
      triggerRefs.current.get(items[items.length - 1]!.id)?.focus();
    }
  }

  return (
    <ul className={cn('divide-y divide-atg-border', className)}>
      {items.map((item, index) => {
        const panelId = `${baseId}-${item.id}-panel`;
        const triggerId = `${baseId}-${item.id}-trigger`;
        const expanded = isOpen(item.id);

        return (
          <li key={item.id}>
            <h3 className="m-0">
              <button
                ref={(node) => {
                  if (node) {
                    triggerRefs.current.set(item.id, node);
                  } else {
                    triggerRefs.current.delete(item.id);
                  }
                }}
                type="button"
                id={triggerId}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-atg-fg hover:bg-atg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset dark:text-white dark:hover:bg-white/5"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => handleTriggerKeyDown(event, index)}
              >
                <span>{item.title}</span>
                <span
                  className={cn(
                    'shrink-0 text-primary transition-transform',
                    expanded && 'rotate-180',
                  )}
                  aria-hidden
                >
                  ▾
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!expanded}
              className="border-t border-atg-border px-4 py-3 text-sm text-atg-muted dark:border-atg-border"
            >
              {item.content}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
