const WORDS_PER_MINUTE = 200;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function estimateReadingTimeMinutes(
  content?: string | null,
  excerpt?: string | null,
): number {
  const text = [content, excerpt].filter(Boolean).join(' ');
  if (!text.trim()) return 1;
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
