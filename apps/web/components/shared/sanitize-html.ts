import DOMPurify from 'isomorphic-dompurify';

/** Sanitize untrusted CMS/HTML before dangerouslySetInnerHTML. */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}
