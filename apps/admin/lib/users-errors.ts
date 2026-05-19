import { ApiHttpError } from '@africatourismgate/api-client';

export function getUsersErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Impossible de joindre l’API. Vérifiez que le serveur est démarré.';
  }

  if (error instanceof ApiHttpError) {
    if (error.status === 403) {
      return 'Vous n’avez pas la permission d’effectuer cette action.';
    }
    if (error.status === 409) {
      return 'Cette adresse e-mail est déjà utilisée par un autre utilisateur.';
    }
    if (error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
    return `Erreur API (${error.status}).`;
  }

  return 'Une erreur est survenue.';
}
