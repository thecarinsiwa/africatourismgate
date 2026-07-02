import createNextIntlPlugin from 'next-intl/plugin';
import { loadRootEnv } from '../../packages/config/load-root-env.mjs';
import { ATG_DOMAINS } from '../../packages/config/domains.mjs';
import {
  isRemoteApiDev,
  getRemoteApiTargetUrl,
  resolveDevApiUrl,
} from '../../packages/config/remote-api-dev.mjs';

loadRootEnv(import.meta.url);

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isProduction = process.env.NODE_ENV === 'production';
const adminPort = process.env.ADMIN_PORT ?? '3001';
const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const remoteProxy = !isProduction && isRemoteApiDev();

const adminUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '') ??
  (isProduction
    ? ATG_DOMAINS.admin.url
    : `http://localhost:${adminPort}`);

const apiUrl = remoteProxy
  ? resolveDevApiUrl({ appPort: adminPort })
  : explicitApiUrl ??
    (isProduction ? ATG_DOMAINS.api.url : resolveDevApiUrl({ appPort: adminPort }));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@africatourismgate/ui',
    '@africatourismgate/api-client',
    '@africatourismgate/types',
    'next-themes',
  ],
  env: {
    NEXT_PUBLIC_ADMIN_URL: adminUrl,
    NEXT_PUBLIC_API_URL: apiUrl,
    ADMIN_PORT: adminPort,
    ATG_REMOTE_API_URL: remoteProxy ? getRemoteApiTargetUrl() : '',
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.svg',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
