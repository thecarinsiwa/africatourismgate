/**
 * Auth request/response types derived from OpenAPI (do not edit — run pnpm codegen:api).
 */
import type { components, paths } from './schema';

export type { components, paths };

export type LoginRequestBody = NonNullable<
  paths['/api/auth/login']['post']['requestBody']
>['content']['application/json'];

export type LoginResponseBody =
  paths['/api/auth/login']['post']['responses'][200]['content']['application/json'];

export type RegisterRequestBody = NonNullable<
  paths['/api/auth/register']['post']['requestBody']
>['content']['application/json'];

export type RegisterResponseBody =
  paths['/api/auth/register']['post']['responses'][200]['content']['application/json'];

export type RefreshTokenRequestBody = NonNullable<
  paths['/api/auth/refresh']['post']['requestBody']
>['content']['application/json'];

export type RefreshTokenResponseBody =
  paths['/api/auth/refresh']['post']['responses'][200]['content']['application/json'];

export type TouchSessionRequestBody = NonNullable<
  paths['/api/auth/touch']['post']['requestBody']
>['content']['application/json'];

export type TouchSessionResponseBody =
  paths['/api/auth/touch']['post']['responses'][200]['content']['application/json'];

export type UnlockSessionRequestBody = NonNullable<
  paths['/api/auth/unlock']['post']['requestBody']
>['content']['application/json'];

export type UnlockSessionResponseBody =
  paths['/api/auth/unlock']['post']['responses'][200]['content']['application/json'];

export type AuthMeResponseBody =
  paths['/api/auth/me']['get']['responses'][200]['content']['application/json'];

export type AuthUserDto = components['schemas']['AuthUserDto'];
export type AuthResponseDto = components['schemas']['AuthResponseDto'];
export type AuthTokensResponseDto = components['schemas']['AuthTokensResponseDto'];
