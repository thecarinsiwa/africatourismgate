/**
 * Raccourcis du navigateur de recherche admin.
 * Principal : Ctrl/⌘+F — alias : Ctrl/⌘+K.
 */

export function isAdminSearchToggleShortcut(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) return false;
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
    return false;
  }
  const key = event.key.toLowerCase();
  return key === 'f' || key === 'k';
}

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
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
 * - Toujours pour Ctrl/⌘+K et Ctrl/⌘+F hors champ éditable
 * - Aussi quand le focus est déjà dans le navigateur (toggle fermeture)
 * - Laisse le find natif du navigateur si Ctrl/⌘+F dans un champ hors modal
 */
export function shouldHandleAdminSearchShortcut(
  event: KeyboardEvent,
  options: { searchOpen: boolean },
): boolean {
  if (!isAdminSearchToggleShortcut(event)) return false;

  if (options.searchOpen) {
    return true;
  }

  const key = event.key.toLowerCase();
  if (
    (key === 'f' || key === 'k') &&
    isEditableKeyboardTarget(event.target)
  ) {
    return false;
  }

  return true;
}
