import type { PackageItemType } from '../../lib/packages/types';

type PackageItemTypeIconProps = {
  itemType: PackageItemType;
  className?: string;
};

const ICON_CLASS = 'h-5 w-5 shrink-0';

export function PackageItemTypeIcon({ itemType, className = '' }: PackageItemTypeIconProps) {
  const combined = `${ICON_CLASS} ${className}`.trim();

  switch (itemType) {
    case 'property':
      return (
        <svg className={combined} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
          />
        </svg>
      );
    case 'flight':
      return (
        <svg className={combined} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M10.18 9.03a1.35 1.35 0 0 1 1.9 0l.07.07 1.41-1.41-.07-.07a3.35 3.35 0 0 0-4.74 0L8.1 8.29l1.41 1.41.67-.67Zm8.72 2.55-1.41-1.41-8.49 8.49 1.41 1.41 8.49-8.49ZM6.1 15.71l-1.41 1.41 1.41 1.41 1.41-1.41-1.41-1.41Z" />
          <path d="M21 7.5 16.5 3 14.09 5.41 15.5 6.82 3 19.32l1.68 1.68L17.18 8.5l1.41 1.41L21 7.5Z" />
        </svg>
      );
    case 'vehicle':
      return (
        <svg className={combined} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M5 17h14M6 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm12 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM4 12h16l-1.5-5h-13L4 12Z"
          />
        </svg>
      );
    case 'cruise':
      return (
        <svg className={combined} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 18c2 1 4 1 8 1s6 0 8-1M6 14h12l-1-6H7l-1 6ZM12 8V4"
          />
        </svg>
      );
    case 'activity':
      return (
        <svg className={combined} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"
          />
        </svg>
      );
    default:
      return null;
  }
}
