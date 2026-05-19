import { getApiClient } from './api';
import { clearSession, getSession } from './session';

/** Révoque le refresh token côté API (best-effort) puis efface la session locale. */
export async function logout(): Promise<void> {
  const session = getSession();
  if (session?.refreshToken) {
    try {
      await getApiClient().logout(session.refreshToken);
    } catch {
      // Idempotent : session locale toujours effacée
    }
  }
  clearSession();
}
