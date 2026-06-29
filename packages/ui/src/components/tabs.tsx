'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../lib/cn';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
  registerTab: (value: string, element: HTMLButtonElement | null) => void;
  getTabValues: () => string[];
  focusTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return ctx;
}

export type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const baseId = useId();
  const tabsRef = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const registerTab = useCallback((tabValue: string, element: HTMLButtonElement | null) => {
    tabsRef.current.set(tabValue, element);
  }, []);

  const getTabValues = useCallback(() => Array.from(tabsRef.current.keys()), []);

  const focusTab = useCallback((tabValue: string) => {
    tabsRef.current.get(tabValue)?.focus();
  }, []);

  const context = useMemo(
    () => ({ value, onValueChange, baseId, registerTab, getTabValues, focusTab }),
    [value, onValueChange, baseId, registerTab, getTabValues, focusTab],
  );

  return (
    <TabsContext.Provider value={context}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
};

export function TabsList({ children, className, 'aria-label': ariaLabel }: TabsListProps) {
  const { value, onValueChange, getTabValues, focusTab } = useTabsContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const values = getTabValues();
    if (values.length === 0) return;

    const currentIndex = values.indexOf(value);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % values.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + values.length) % values.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = values.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextValue = values[nextIndex];
    if (nextValue) {
      onValueChange(nextValue);
      focusTab(nextValue);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-atg-border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export type TabsTriggerProps = {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function TabsTrigger({ value: tabValue, children, className, disabled }: TabsTriggerProps) {
  const { value, onValueChange, baseId, registerTab } = useTabsContext();
  const selected = value === tabValue;
  const tabId = `${baseId}-tab-${tabValue}`;
  const panelId = `${baseId}-panel-${tabValue}`;

  return (
    <button
      ref={(el) => registerTab(tabValue, el)}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => onValueChange(tabValue)}
      className={cn(
        'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected
          ? 'border-primary text-primary'
          : 'border-transparent text-atg-muted hover:border-atg-border hover:text-atg-fg',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export type TabsContentProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabsContent({ value: tabValue, children, className }: TabsContentProps) {
  const { value, baseId } = useTabsContext();
  if (value !== tabValue) return null;

  const tabId = `${baseId}-tab-${tabValue}`;
  const panelId = `${baseId}-panel-${tabValue}`;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={cn('pt-6 focus:outline-none', className)}
    >
      {children}
    </div>
  );
}
