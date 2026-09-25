type Listener = (locked: boolean) => void;

let locked = false;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => {
    listener(locked);
  });
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
