import type { ReactNode } from 'react';

type SectionPlaceholderIconProps = {
  className?: string;
};

export function SupportMessagesPlaceholderIcon({
  className = 'h-8 w-8',
}: SectionPlaceholderIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l.8-3.2A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

export function GenericSectionPlaceholderIcon({
  className = 'h-8 w-8',
}: SectionPlaceholderIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export type SectionPlaceholderCta = {
  href: string;
  label: string;
};

export type SectionPlaceholderConfig = {
  icon: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  cta?: SectionPlaceholderCta;
};

export function getSectionPlaceholderConfig(sectionKey: string): SectionPlaceholderConfig {
  if (sectionKey === 'contenu/messages') {
    return {
      icon: <SupportMessagesPlaceholderIcon />,
      emptyTitle: 'Messages dans les tickets',
      emptyDescription:
        'Les échanges avec les clients se font dans le fil de chaque ticket support. Ouvrez un ticket pour lire et répondre aux messages.',
      cta: {
        href: '/contenu/tickets',
        label: 'Voir les tickets',
      },
    };
  }

  return {
    icon: <GenericSectionPlaceholderIcon />,
  };
}
