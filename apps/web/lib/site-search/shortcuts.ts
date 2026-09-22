/**
 * Raccourcis du navigateur de recherche publique.
 * Principal : Ctrl/⌘+K — alias : touche `/`.
 * Ctrl/⌘+F n’est volontairement pas intercepté (find natif du navigateur).
 */

export function isSiteSearchToggleShortcut(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) return false;

  // Certains événements clavier (IME, autofill, extensions) n’exposent pas `key`.
  if (typeof event.key !== 'string' || event.key.length === 0) {
    return false;
  }

  const key = event.key.toLowerCase();

  // Ctrl/⌘+K (sans Alt/Shift)
  if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
    return key === 'k';
  }

  // Touche `/` sans Ctrl/Meta/Alt (Shift autorisé selon la disposition clavier)
  if (!event.metaKey && !event.ctrlKey && !event.altKey) {
    return event.key === '/';
  }

  return false;
}

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === 'undefined') {
    return false;
  }
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return Boolean(
    target.closest('[contenteditable="true"], input, textarea, select'),
  );
}

/**
 * Doit-on ouvrir / fermer le navigateur pour cet événement ?
 * - Toujours pour Ctrl/⌘+K et `/` hors champ éditable
 * - Aussi quand le focus est déjà dans le navigateur (toggle fermeture)
 * - Ne capture jamais Ctrl/⌘+F (recherche native du navigateur)
 */
export function shouldHandleSiteSearchShortcut(
  event: KeyboardEvent,
  options: { searchOpen: boolean },
): boolean {
  if (!isSiteSearchToggleShortcut(event)) return false;

  if (options.searchOpen) {
    return true;
  }

  if (isEditableKeyboardTarget(event.target)) {
    return false;
  }

  return true;
}
