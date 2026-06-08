import { ApiHttpError, parseApiErrorMessage } from '@africatourismgate/api-client';

export function getLoyaltyAccountsErrorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 401) {
      return 'Session expirée. Reconnectez-vous.';
    }
    if (error.status === 403) {
      return 'Accès refusé. Lecture : users.read — ajustement : super administrateur uniquement.';
    }
    if (error.status === 404) {
      return 'Compte fidélité introuvable.';
    }
    return parseApiErrorMessage(error) ?? 'Une erreur est survenue.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur est survenue.';
}
