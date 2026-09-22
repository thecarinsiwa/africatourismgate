'use client';

import { cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { parseWebHelpRichText } from '../../lib/support/web-path-links';

export type SupportHelpRichTextProps = {
  text: string;
  className?: string;
};

/** Rendu riche d’un paragraphe d’aide : texte + liens allowlistés. */
export function SupportHelpRichText({
  text,
  className,
}: SupportHelpRichTextProps) {
  const segments = parseWebHelpRichText(text);

  if (segments.length === 0) {
    return null;
  }

  return (
    <span className={cn(className)}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={`t-${index}`}>{segment.text}</span>;
        }

        return (
          <Link
            key={`l-${index}-${segment.href}`}
            href={segment.href}
            className="font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:underline"
          >
            {segment.text}
          </Link>
        );
      })}
    </span>
  );
}
