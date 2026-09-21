'use client';

import { cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { parseAdminHelpRichText } from '../../lib/admin-help/admin-path-links';

export type AdminHelpRichTextProps = {
  text: string;
  className?: string;
};

export function AdminHelpRichText({ text, className }: AdminHelpRichTextProps) {
  const segments = parseAdminHelpRichText(text);

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
