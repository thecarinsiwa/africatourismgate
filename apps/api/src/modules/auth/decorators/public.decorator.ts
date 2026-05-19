import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skip JwtAuthGuard (e.g. health, auth routes). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
