import { loadRootEnv } from '../../packages/config/load-root-env.mjs';

loadRootEnv(import.meta.url);

const adminUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '') ??
  (process.env.NODE_ENV === 'production'
    ? 'https://app-africatourismgate.org'
    : `http://localhost:${process.env.ADMIN_PORT ?? '3001'}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@africatourismgate/ui'],
  env: {
    NEXT_PUBLIC_ADMIN_URL: adminUrl,
  },
};

export default nextConfig;
