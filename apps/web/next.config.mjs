import { loadRootEnv } from '../../packages/config/load-root-env.mjs';
import { ADMIN_ONLY_PATHS, ATG_DOMAINS } from '../../packages/config/domains.mjs';

loadRootEnv(import.meta.url);

const adminBaseUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '') ??
  (process.env.NODE_ENV === 'production'
    ? ATG_DOMAINS.admin.url
    : `http://localhost:${process.env.ADMIN_PORT ?? '3001'}`);

const AUTH_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@africatourismgate/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  async redirects() {
    const redirects = [];

    for (const path of ADMIN_ONLY_PATHS) {
      redirects.push({
        source: path,
        destination: `${adminBaseUrl}${path}`,
        permanent: true,
      });

      if (!AUTH_EXACT_PATHS.has(path)) {
        redirects.push({
          source: `${path}/:path*`,
          destination: `${adminBaseUrl}${path}/:path*`,
          permanent: true,
        });
      }
    }

    return redirects;
  },
};

export default nextConfig;
