import { loadRootEnv } from '../../packages/config/load-root-env.mjs';
import { ATG_DOMAINS } from '../../packages/config/domains.mjs';

loadRootEnv(import.meta.url);

const isProduction = process.env.NODE_ENV === 'production';

const adminUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '') ??
  (isProduction
    ? ATG_DOMAINS.admin.url
    : `http://localhost:${process.env.ADMIN_PORT ?? '3001'}`);

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
  (isProduction ? ATG_DOMAINS.api.url : 'http://localhost:3000/api');

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
  },
};

export default nextConfig;
