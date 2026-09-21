import type { ReactNode } from 'react';

type HighlightSegment = {
  text: string;
  match: boolean;
};

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Split `text` into matched / unmatched segments for the search query. */
export function splitAdminHelpHighlightSegments(
  text: string,
  query: string,
): HighlightSegment[] {
  const normalizedQuery = normalizeForMatch(query.trim());
  if (!text || !normalizedQuery) {
    return [{ text, match: false }];
  }

  const indexMap: number[] = [];
  let normalized = '';

  for (let i = 0; i < text.length; i += 1) {
    const normalizedChar = normalizeForMatch(text[i] ?? '');
    if (normalizedChar.length === 0) {
      continue;
    }
    for (let j = 0; j < normalizedChar.length; j += 1) {
      indexMap.push(i);
      normalized += normalizedChar[j];
    }
  }

  const segments: HighlightSegment[] = [];
  let searchFrom = 0;
  let lastOriginalEnd = 0;

  while (searchFrom < normalized.length) {
    const foundAt = normalized.indexOf(normalizedQuery, searchFrom);
    if (foundAt === -1) {
      break;
    }

    const matchStartOrig = indexMap[foundAt] ?? 0;
    const matchEndNorm = foundAt + normalizedQuery.length - 1;
    const matchEndOrig = (indexMap[matchEndNorm] ?? matchStartOrig) + 1;

    if (matchStartOrig > lastOriginalEnd) {
      segments.push({
        text: text.slice(lastOriginalEnd, matchStartOrig),
        match: false,
      });
    }

    segments.push({
      text: text.slice(matchStartOrig, matchEndOrig),
      match: true,
    });
    lastOriginalEnd = matchEndOrig;
    searchFrom = foundAt + normalizedQuery.length;
  }

  if (lastOriginalEnd < text.length) {
    segments.push({ text: text.slice(lastOriginalEnd), match: false });
  }

  return segments.length > 0 ? segments : [{ text, match: false }];
}

export function AdminHelpHighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}): ReactNode {
  const segments = splitAdminHelpHighlightSegments(text, query);

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
