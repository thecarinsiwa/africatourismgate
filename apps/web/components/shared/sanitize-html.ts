import sanitizeHtmlLib from 'sanitize-html';

/**
 * Sanitize untrusted CMS/HTML before dangerouslySetInnerHTML.
 * Uses sanitize-html (no jsdom/undici) so Next page-data collect stays stable.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: [
      ...sanitizeHtmlLib.defaults.allowedTags,
      'img',
      'h1',
      'h2',
    ],
    allowedAttributes: {
      ...sanitizeHtmlLib.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
      '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const next = { ...attribs };
        if (next.target === '_blank') {
          next.rel = 'noopener noreferrer';
        }
        return { tagName, attribs: next };
      },
    },
  });
}
