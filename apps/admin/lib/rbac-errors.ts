import { ApiHttpError } from '@africatourismgate/api-client';

export function getRbacErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Impossible de joindre l’API. Vérifiez que le serveur est démarré.';
  }

  if (error instanceof ApiHttpError) {
    if (error.status === 403) {
      if (error.message?.includes('système')) {
        return error.message;
      }
      return (
        'Accès refusé : votre compte n’a pas les permissions requises (users.read, roles.read). ' +
        'Reconnectez-vous avec admin@africatourismgate.local ou exécutez pnpm --filter @africatourismgate/api sync:rbac puis redémarrez l’API.'
      );
    }
    if (error.status === 409) {
      return 'Cette assignation existe déjà pour ce périmètre.';
    }
    if (error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
    return `Erreur API (${error.status}).`;
  }

  return 'Une erreur est survenue.';
}
