import type { GapActivityIconKey } from '@africatourismgate/types';

const ICON_LABELS: Record<GapActivityIconKey, string> = {
  school: '🏫',
  tree: '🌳',
  art: '🎨',
  park: '🏞️',
  community: '🤝',
};

export function GapActivityIcon({ iconKey }: { iconKey: GapActivityIconKey }) {
  return (
    <span
      className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl"
      aria-hidden
    >
      {ICON_LABELS[iconKey]}
    </span>
  );
}
