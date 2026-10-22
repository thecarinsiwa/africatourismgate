'use client';

import { useCallback, useEffect, useState } from 'react';

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, quota): keep in-memory state only.
  }
}

/**
 * String state mirrored to localStorage. The stored value is applied after mount
 * (SSR renders `defaultValue`) and only when `isValid` accepts it.
 */
export function usePersistentState<T extends string>(
  key: string,
  defaultValue: T,
  isValid: (value: unknown) => value is T,
): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const saved = readStorage(key);
    if (isValid(saved)) setValue(saved);
  }, [key, isValid]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      writeStorage(key, next);
    },
    [key],
  );

  return [value, update];
}
