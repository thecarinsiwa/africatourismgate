'use client';

import { useCallback, useEffect, useState } from 'react';

export function useUnsavedChangesGuard(isDirty: boolean) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const requestAction = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      setPendingAction(() => action);
      setDialogOpen(true);
    },
    [isDirty],
  );

  const confirmDiscard = useCallback(() => {
    setDialogOpen(false);
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const cancelDiscard = useCallback(() => {
    setDialogOpen(false);
    setPendingAction(null);
  }, []);

  return {
    dialogOpen,
    setDialogOpen,
    requestAction,
    confirmDiscard,
    cancelDiscard,
  };
}
