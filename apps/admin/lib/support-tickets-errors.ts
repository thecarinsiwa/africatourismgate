import { ApiHttpError, parseApiErrorMessage } from '@africatourismgate/api-client';

export function getSupportTicketsErrorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 401) {
      return 'Session expirée. Reconnectez-vous.';
    }
    if (error.status === 403) {
      return 'Vous n’avez pas la permission d’effectuer cette action (support_tickets.read / support_tickets.write).';
    }
    if (error.status === 404) {
      return 'Ticket introuvable.';
    }
    return parseApiErrorMessage(error) ?? 'Une erreur est survenue.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur est survenue.';
}
