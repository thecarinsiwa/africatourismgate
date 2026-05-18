import { loadRootEnv } from '../../packages/config/load-root-env.mjs';

loadRootEnv(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@africatourismgate/ui'],
};

export default nextConfig;
