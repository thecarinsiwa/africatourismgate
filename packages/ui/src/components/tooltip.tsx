'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type TooltipPosition = 'top' | 'bottom';

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  id?: string;
  className?: string;
};

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
};

export function Tooltip({
  content,
  children,
  position = 'top',
  id: idProp,
  className,
}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = idProp ?? generatedId;

  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      <span aria-describedby={tooltipId} className="inline-flex">
        {children}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 max-w-xs rounded-md border border-atg-border bg-atg-elevated px-2.5 py-1.5 text-xs text-atg-fg shadow-md',
          'opacity-0 transition-opacity duration-150',
          'group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          positionClasses[position],
        )}
      >
        {content}
      </span>
    </span>
  );
}
