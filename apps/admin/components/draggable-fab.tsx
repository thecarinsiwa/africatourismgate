'use client';

import { cn } from '@africatourismgate/ui';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

const FAB_SIZE = 80;
const VIEWPORT_MARGIN = 24;
const DRAG_THRESHOLD_PX = 6;

type FabPosition = { x: number; y: number };

function defaultBottomRight(): FabPosition {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }
  return {
    x: window.innerWidth - FAB_SIZE - VIEWPORT_MARGIN,
    y: window.innerHeight - FAB_SIZE - VIEWPORT_MARGIN,
  };
}

function clampPosition(position: FabPosition): FabPosition {
  if (typeof window === 'undefined') {
    return position;
  }
  const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - FAB_SIZE - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - FAB_SIZE - VIEWPORT_MARGIN);
  return {
    x: Math.min(Math.max(VIEWPORT_MARGIN, position.x), maxX),
    y: Math.min(Math.max(VIEWPORT_MARGIN, position.y), maxY),
  };
}

function loadStoredPosition(storageKey: string | undefined): FabPosition | null {
  if (!storageKey || typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FabPosition;
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {
      return null;
    }
    return clampPosition(parsed);
  } catch {
    return null;
  }
}

type DraggableFabProps = {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  storageKey?: string;
  badgeCount?: number;
};

export function DraggableFab({
  onClick,
  ariaLabel,
  children,
  className,
  storageKey,
  badgeCount = 0,
}: DraggableFabProps) {
  const [position, setPosition] = useState<FabPosition>(() => {
    return loadStoredPosition(storageKey) ?? defaultBottomRight();
  });

  const dragState = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startClientX: 0,
    startClientY: 0,
    startX: 0,
    startY: 0,
  });

  const persistPosition = useCallback(
    (next: FabPosition) => {
      if (!storageKey || typeof window === 'undefined') {
        return;
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore quota / private mode
      }
    },
    [storageKey],
  );

  useEffect(() => {
    const onResize = () => {
      setPosition((current) => clampPosition(current));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }
    dragState.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: position.x,
      startY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    if (!drag.active || event.pointerId !== drag.pointerId) {
      return;
    }
    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;
    if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD_PX) {
      return;
    }
    drag.moved = true;
    const next = clampPosition({
      x: drag.startX + deltaX,
      y: drag.startY + deltaY,
    });
    setPosition(next);
  };

  const finishPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    if (!drag.active || event.pointerId !== drag.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const wasDrag = drag.moved;
    const next = clampPosition({
      x: drag.startX + (event.clientX - drag.startClientX),
      y: drag.startY + (event.clientY - drag.startClientY),
    });
    drag.active = false;
    drag.moved = false;
    drag.pointerId = -1;
    if (wasDrag) {
      setPosition(next);
      persistPosition(next);
      return;
    }
    onClick();
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'fixed z-40 flex size-20 cursor-grab touch-none items-center justify-center rounded-2xl border border-primary/20 bg-primary p-3 text-white shadow-lg shadow-primary/25 transition-[box-shadow,background-color] hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-primary/30 dark:shadow-black/40',
        className,
      )}
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
    >
      {children}
      {badgeCount > 0 ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-primary"
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      ) : null}
    </button>
  );
}
