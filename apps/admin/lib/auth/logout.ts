import { getApiClient } from './api';
import { clearAuthState, getSession } from './session';

/** Révoque le refresh token côté API (best-effort) puis efface la session locale. */
export async function logout(): Promise<void> {
  const session = getSession();
  const refreshToken = session?.refreshToken;
  if (refreshToken) {
    try {
      await getApiClient().logout(refreshToken);
    } catch {
      // Idempotent : session locale toujours effacée
    }
  }
  clearAuthState();
}
