type Listener = (locked: boolean) => void;

let locked = false;
const listeners = new Set<Listener>();

/** Set via Playwright storageState / init script so e2e never shows the lock overlay. */
export const E2E_DISABLE_CONNECTION_LOCK_KEY = 'atg.e2e.disableConnectionLock';

function emit(): void {
  listeners.forEach((listener) => {
    listener(locked);
  });
}

/** True under Playwright (`navigator.webdriver`) or when the e2e localStorage flag is set. */
export function isConnectionLockSuppressed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return true;
    }
    return window.localStorage?.getItem(E2E_DISABLE_CONNECTION_LOCK_KEY) === '1';
  } catch {
    return false;
  }
}

export function isConnectionLocked(): boolean {
  return locked;
}

export function subscribeConnectionLock(listener: Listener): () => void {
  listeners.add(listener);
  listener(locked);
  return () => {
    listeners.delete(listener);
  };
}

export function lockConnection(): void {
  if (isConnectionLockSuppressed()) {
    return;
  }
  if (locked) {
    return;
  }
  locked = true;
  emit();
}

export function unlockConnection(): void {
  if (!locked) {
    return;
  }
  locked = false;
  emit();
}

/** Signal global : API injoignable (réseau / CORS / fetch échoué). Idempotent. */
export function notifyApiUnreachable(): void {
  lockConnection();
}

export function isApiUnreachableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  if (message.includes('api unreachable')) {
    return true;
  }
  if (message.includes('failed to fetch') || message.includes('networkerror')) {
    return true;
  }
  if (error.name === 'TypeError') {
    return true;
  }
  const cause = error.cause;
  if (cause instanceof TypeError) {
    return true;
  }
  if (cause instanceof Error) {
    const causeMessage = cause.message.toLowerCase();
    return (
      causeMessage.includes('failed to fetch') ||
      causeMessage.includes('networkerror') ||
      cause.name === 'TypeError'
    );
  }
  return false;
}
