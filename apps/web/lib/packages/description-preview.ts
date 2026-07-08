export const PACKAGE_DESCRIPTION_PREVIEW_WORDS = 10;

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function toWordsPreview(
  text: string,
  wordCount: number = PACKAGE_DESCRIPTION_PREVIEW_WORDS,
): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= wordCount) return text;
  return `${words.slice(0, wordCount).join(' ')}…`;
}

export function packageDescriptionPreview(
  html: string | null | undefined,
  wordCount: number = PACKAGE_DESCRIPTION_PREVIEW_WORDS,
): string {
  if (!html?.trim()) return '';
  return toWordsPreview(stripHtml(html), wordCount);
}
