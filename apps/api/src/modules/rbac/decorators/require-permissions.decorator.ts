import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../rbac.constants';

/** Require at least one of the listed permission codes (e.g. `users.read`). */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
