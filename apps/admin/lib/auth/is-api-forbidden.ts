import { ApiHttpError } from '@africatourismgate/api-client';

export function isApiForbidden(error: unknown): boolean {
  return error instanceof ApiHttpError && error.status === 403;
}
