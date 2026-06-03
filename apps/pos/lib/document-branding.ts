export function applyFaviconToDocument(faviconUrl: string | null): void {
  if (typeof document === 'undefined') return;

  const selector = 'link[data-atg-dynamic-favicon="1"]';
  const existing = document.querySelector<HTMLLinkElement>(selector);

  if (!faviconUrl) {
    existing?.remove();
    return;
  }

  const link = existing ?? document.createElement('link');
  link.rel = 'icon';
  link.href = faviconUrl;
  link.setAttribute('data-atg-dynamic-favicon', '1');
  if (!existing) {
    document.head.appendChild(link);
  }
}
