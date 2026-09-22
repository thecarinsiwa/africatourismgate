import type { ReactNode } from 'react';
import { splitWebHelpHighlightSegments } from '../../lib/support/highlight';

export { splitWebHelpHighlightSegments } from '../../lib/support/highlight';

export function SupportHelpHighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}): ReactNode {
  const segments = splitWebHelpHighlightSegments(text, query);

  return segments.map((segment, index) =>
    segment.match ? (
      <mark
        key={`m-${index}`}
        className="rounded-sm bg-primary/15 text-inherit"
      >
        {segment.text}
      </mark>
    ) : (
      <span key={`t-${index}`}>{segment.text}</span>
    ),
  );
}
