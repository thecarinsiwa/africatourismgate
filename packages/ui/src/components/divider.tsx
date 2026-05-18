import { cn } from '../lib/cn';

export type DividerProps = {
  children?: React.ReactNode;
  className?: string;
};

/** Séparateur horizontal avec libellé centré optionnel. */
export function Divider({ children, className }: DividerProps) {
  if (!children) {
    return <hr className={cn('border-t border-atg-border', className)} />;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-atg-border" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-atg-elevated px-3 text-atg-muted">{children}</span>
      </div>
    </div>
  );
}
