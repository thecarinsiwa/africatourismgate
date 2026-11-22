/** HTML helpers without DOMPurify - safe to import from Server Components / generateMetadata. */

export function hasHtmlMarkup(value: string | null | undefined): boolean {
  if (!value) return false;
  return /<[^>]+>/.test(value);
}

export function stripHtml(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
