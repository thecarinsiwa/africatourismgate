export type PromotionTargetAudience = 'all' | 'new_users' | 'specific_products';

const TARGET_MARKER = '<!--atg-target:';
const TARGET_MARKER_END = '-->';

export function parsePromotionDescription(raw: string | null | undefined): {
  description: string;
  targetAudience: PromotionTargetAudience;
  targetDetails: string;
} {
  const text = raw?.trim() ?? '';
  if (!text.startsWith(TARGET_MARKER)) {
    return { description: text, targetAudience: 'all', targetDetails: '' };
  }
  const end = text.indexOf(TARGET_MARKER_END);
  if (end < 0) {
    return { description: text, targetAudience: 'all', targetDetails: '' };
  }
  const meta = text.slice(TARGET_MARKER.length, end).trim();
  const rest = text.slice(end + TARGET_MARKER_END.length).replace(/^\n+/, '');
  const [audienceRaw = 'all', ...detailParts] = meta.split('|');
  const audience = (['all', 'new_users', 'specific_products'] as const).includes(
    audienceRaw as PromotionTargetAudience,
  )
    ? (audienceRaw as PromotionTargetAudience)
    : 'all';
  return {
    description: rest,
    targetAudience: audience,
    targetDetails: detailParts.join('|').trim(),
  };
}

export function composePromotionDescription(input: {
  description: string;
  targetAudience: PromotionTargetAudience;
  targetDetails: string;
}): string | null {
  const description = input.description.trim();
  const details = input.targetDetails.trim();
  const needsMeta = input.targetAudience !== 'all' || details.length > 0;
  if (!needsMeta) {
    return description || null;
  }
  const meta = `${TARGET_MARKER}${input.targetAudience}|${details}${TARGET_MARKER_END}`;
  return description ? `${meta}\n${description}` : meta;
}

/** Public / list display: strip embedded target metadata. */
export function displayPromotionDescription(raw: string | null | undefined): string {
  return parsePromotionDescription(raw).description;
}
