const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
  );
}

/** Prefer explicit autofocus, then first form control, then first focusable element. */
export function getInitialFocusElement(container: HTMLElement): HTMLElement | null {
  const explicit = container.querySelector<HTMLElement>('[autofocus]');
  if (explicit && !explicit.hasAttribute('disabled')) {
    return explicit;
  }

  const formControl = container.querySelector<HTMLElement>(
    'textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
  );
  if (formControl && formControl.offsetParent !== null) {
    return formControl;
  }

  const focusable = getFocusableElements(container);
  return focusable[0] ?? null;
}

export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !container.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else if (active === last) {
    event.preventDefault();
    first.focus();
  }
}
