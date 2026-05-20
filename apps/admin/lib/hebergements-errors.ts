import { ApiHttpError } from '@africatourismgate/api-client';

export function getHebergementsErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Impossible de joindre l’API. Vérifiez que le serveur est démarré.';
  }

  if (error instanceof ApiHttpError) {
    if (error.status === 403) {
      return 'Vous n’avez pas la permission d’effectuer cette action.';
    }
    if (error.status === 409) {
      if (error.message?.includes('slug')) {
        return 'Ce slug est déjà utilisé par une autre propriété.';
      }
      if (error.message?.includes('code')) {
        return 'Ce code est déjà utilisé par un autre équipement.';
      }
      if (
        error.message?.includes('disponibilité') ||
        error.message?.includes('date')
      ) {
        return (
          error.message ||
          'Une disponibilité existe déjà pour cette date.'
        );
      }
      return 'Conflit : cette ressource existe déjà.';
    }
    if (error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
    return `Erreur API (${error.status}).`;
  }

  return 'Une erreur est survenue.';
}
