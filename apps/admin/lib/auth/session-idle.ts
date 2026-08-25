export const SESSION_IDLE_LOCK_MS =
  Number(process.env.NEXT_PUBLIC_SESSION_IDLE_LOCK_SECONDS ?? 3600) * 1000;

export const SESSION_TOUCH_DEBOUNCE_MS = 5 * 60 * 1000;

const LAST_ACTIVITY_KEY = 'atg.admin.lastActivity';
const LOCKED_KEY = 'atg.admin.locked';

export const SESSION_LOCK_CHANGED_EVENT = 'atg:admin:session-lock-changed';

export function getLastActivityAt(): number {
  if (typeof window === 'undefined') return Date.now();
  const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function markActivity(at = Date.now()): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LAST_ACTIVITY_KEY, String(at));
}

export function isSessionLocked(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(LOCKED_KEY) === '1';
}

export function setSessionLocked(locked: boolean): void {
  if (typeof window === 'undefined') return;
  if (locked) {
    sessionStorage.setItem(LOCKED_KEY, '1');
  } else {
    sessionStorage.removeItem(LOCKED_KEY);
  }
  window.dispatchEvent(
    new CustomEvent(SESSION_LOCK_CHANGED_EVENT, { detail: { locked } }),
  );
}

export function resetSessionActivity(): void {
  markActivity();
  setSessionLocked(false);
}

export function clearSessionIdleState(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  sessionStorage.removeItem(LOCKED_KEY);
}

export function isIdleExpired(now = Date.now()): boolean {
  return now - getLastActivityAt() >= SESSION_IDLE_LOCK_MS;
}
