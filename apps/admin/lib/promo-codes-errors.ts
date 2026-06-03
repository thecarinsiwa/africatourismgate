import { ApiHttpError, parseApiErrorMessage } from '@africatourismgate/api-client';

export function getPromoCodesErrorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 401) {
      return 'Session expirée. Reconnectez-vous.';
    }
    if (error.status === 403) {
      return 'Vous n’avez pas la permission d’effectuer cette action (promo_codes.read / promo_codes.write).';
    }
    if (error.status === 409) {
      return parseApiErrorMessage(error) ?? 'Ce code promo existe déjà.';
    }
    return parseApiErrorMessage(error) ?? 'Une erreur est survenue.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur est survenue.';
}
