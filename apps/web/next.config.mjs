import { loadRootEnv } from '../../packages/config/load-root-env.mjs';
import { ATG_DOMAINS } from '../../packages/config/domains.mjs';

loadRootEnv(import.meta.url);

const adminLoginUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '') ??
  (process.env.NODE_ENV === 'production'
    ? ATG_DOMAINS.admin.loginUrl.replace(/\/login$/, '')
    : `http://localhost:${process.env.ADMIN_PORT ?? '3001'}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@africatourismgate/ui'],
  async redirects() {
    return [
      {
        source: '/login',
        destination: `${adminLoginUrl}/login`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
