export function parseApiErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const message = (body as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const parts = message.filter((item): item is string => typeof item === 'string');
    if (parts.length > 0) {
      return parts.join(' ');
    }
  }

  return undefined;
}

export class ApiHttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown, message?: string) {
    super(message ?? `HTTP ${status} ${statusText}`);
    this.name = 'ApiHttpError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export function getApiErrorCode(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const code = (body as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

export function isSessionLockedApiError(error: unknown): boolean {
  if (!(error instanceof ApiHttpError)) {
    return false;
  }
  return getApiErrorCode(error.body) === 'SESSION_LOCKED';
}
