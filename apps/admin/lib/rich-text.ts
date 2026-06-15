/** Returns true when HTML has no visible text content. */
export function isRichTextEmpty(html: string): boolean {
  const stripped = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length === 0;
}

/** Plain text preview from HTML (for cards and truncated displays). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
