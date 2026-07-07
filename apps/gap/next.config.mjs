import createNextIntlPlugin from 'next-intl/plugin';
import { loadRootEnv } from '../../packages/config/load-root-env.mjs';
import {
  isRemoteApiDev,
  getRemoteApiTargetUrl,
  resolveDevApiUrl,
} from '../../packages/config/remote-api-dev.mjs';

loadRootEnv(import.meta.url);

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isProduction = process.env.NODE_ENV === 'production';
const gapPort = process.env.GAP_PORT ?? '3004';
const gapPublicUrl =
  process.env.NEXT_PUBLIC_GAP_URL?.replace(/\/$/, '') ??
  (isProduction ? 'https://gap.africatourismgate.org' : `http://localhost:${gapPort}`);
const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const remoteProxy = !isProduction && isRemoteApiDev();

const apiUrl = remoteProxy
  ? resolveDevApiUrl({ appPort: gapPort })
  : explicitApiUrl ??
    (isProduction
      ? 'https://app-africatourismgate.org/api'
      : resolveDevApiUrl({ appPort: gapPort }));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@africatourismgate/ui', '@africatourismgate/types'],
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    GAP_PORT: gapPort,
    NEXT_PUBLIC_GAP_URL: gapPublicUrl,
    ATG_REMOTE_API_URL: remoteProxy ? getRemoteApiTargetUrl() : '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'app-africatourismgate.org',
        pathname: '/api/uploads/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
