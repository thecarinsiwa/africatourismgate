const CLIENT_INSTANCE_STORAGE_KEY = 'atg.client.instance';

/** Stable browser profile id — survives tab close; not an auth token. */
export function getOrCreateClientInstanceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const existing = localStorage.getItem(CLIENT_INSTANCE_STORAGE_KEY)?.trim();
    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID();
    localStorage.setItem(CLIENT_INSTANCE_STORAGE_KEY, id);
    return id;
  } catch {
    return '';
  }
}

export function withClientInstanceId<T extends object>(body: T): T {
  const clientInstanceId = getOrCreateClientInstanceId();
  if (!clientInstanceId) {
    return body;
  }
  return { ...body, clientInstanceId };
}
