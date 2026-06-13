import { cn } from '@africatourismgate/ui';

type AdminPageIntroProps = {
  description?: string;
  className?: string;
};

/** Description sous le titre du shell (le titre est géré par AppHeader). */
export function AdminPageIntro({ description, className }: AdminPageIntroProps) {
  if (!description) return null;

  return (
    <p className={cn('mb-8 text-sm text-atg-muted', className)}>{description}</p>
  );
}
