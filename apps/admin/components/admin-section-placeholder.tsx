import type { ReactNode } from 'react';

type SectionPlaceholderIllustrationProps = {
  className?: string;
};

/** Support : bulle de conversation + ticket. */
export function SupportPlaceholderIllustration({
  className = 'h-10 w-10',
}: SectionPlaceholderIllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 30c-2.2 0-4-1.8-4-4V14c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v12c0 2.2-1.8 4-4 4H18l-6 6v-6z"
      />
      <path strokeLinecap="round" d="M12 16h16M12 21h10" />
      <circle cx="16" cy="25" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="20" cy="25" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="24" cy="25" r="0.75" fill="currentColor" stroke="none" />
      <rect
        x="28"
        y="6"
        width="14"
        height="18"
        rx="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path strokeLinecap="round" strokeDasharray="2 2" d="M28 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M31 17h8M31 21h5" />
    </svg>
  );
}

/** Voyage : globe + avion. */
export function TravelPlaceholderIllustration({
  className = 'h-10 w-10',
}: SectionPlaceholderIllustrationProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <circle cx="22" cy="26" r="13" strokeLinecap="round" strokeLinejoin="round" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 26h26M22 13c3.5 3 5.5 7.2 5.5 13S25.5 36 22 39M22 13c-3.5 3-5.5 7.2-5.5 13s2 10 5.5 13"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M34 10l3 2-2 4 2 1-3 2-1-4-4-1 1-3 4 1z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M33 14l5 5" opacity={0.5} />
    </svg>
  );
}

export type SectionPlaceholderIllustration = 'support' | 'travel';

export type SectionPlaceholderConfig = {
  illustration: SectionPlaceholderIllustration;
  icon: ReactNode;
  ctaHref?: string;
};

const ILLUSTRATION_COMPONENTS: Record<
  SectionPlaceholderIllustration,
  typeof SupportPlaceholderIllustration
> = {
  support: SupportPlaceholderIllustration,
  travel: TravelPlaceholderIllustration,
};

const SECTION_PLACEHOLDER_OVERRIDES: Record<
  string,
  Pick<SectionPlaceholderConfig, 'illustration' | 'ctaHref'>
> = {
  'contenu/messages': {
    illustration: 'support',
    ctaHref: '/contenu/support?tab=tickets',
  },
};

function buildPlaceholderConfig(
  illustration: SectionPlaceholderIllustration,
  ctaHref?: string,
): SectionPlaceholderConfig {
  const Illustration = ILLUSTRATION_COMPONENTS[illustration];
  return {
    illustration,
    icon: <Illustration className="h-12 w-12" />,
    ...(ctaHref ? { ctaHref } : {}),
  };
}

export function getSectionPlaceholderConfig(sectionKey: string): SectionPlaceholderConfig {
  const override = SECTION_PLACEHOLDER_OVERRIDES[sectionKey];
  if (override) {
    return buildPlaceholderConfig(override.illustration, override.ctaHref);
  }

  return buildPlaceholderConfig('travel');
}
