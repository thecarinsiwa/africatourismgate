import createNextIntlPlugin from 'next-intl/plugin';
import { loadRootEnv } from '../../packages/config/load-root-env.mjs';
import { ADMIN_ONLY_PATHS, ATG_DOMAINS } from '../../packages/config/domains.mjs';
import {
  isRemoteApiDev,
  getRemoteApiTargetUrl,
  resolveDevApiUrl,
} from '../../packages/config/remote-api-dev.mjs';

loadRootEnv(import.meta.url);

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isProduction = process.env.NODE_ENV === 'production';
const webPort = process.env.WEB_PORT ?? '3002';
const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const remoteProxy = !isProduction && isRemoteApiDev();

const apiUrl = remoteProxy
  ? resolveDevApiUrl({ appPort: webPort })
  : explicitApiUrl ??
    (isProduction ? ATG_DOMAINS.api.url : resolveDevApiUrl({ appPort: webPort }));

const adminBaseUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '') ??
  (process.env.NODE_ENV === 'production'
    ? ATG_DOMAINS.admin.url
    : `http://localhost:${process.env.ADMIN_PORT ?? '3001'}`);

const gapPublicUrl =
  process.env.NEXT_PUBLIC_GAP_URL?.replace(/\/$/, '') ??
  (isProduction ? ATG_DOMAINS.gap.url : `http://localhost:${process.env.GAP_PORT ?? '3004'}`);

const AUTH_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@africatourismgate/ui', '@africatourismgate/types'],
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_GAP_URL: gapPublicUrl,
    WEB_PORT: webPort,
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

    const legacyAboutRedirects = [
      ['/a-propos', '/about/who-we-are'],
      ['/a-propos/qui-nous-sommes', '/about/who-we-are'],
      ['/a-propos/notre-histoire', '/about/our-history'],
      ['/a-propos/equipe', '/about/team'],
      ['/a-propos/comment-nous-travaillons', '/about/how-we-work'],
      ['/a-propos/gouvernance', '/about/governance'],
      ['/a-propos/rapports-finances', '/about/reports'],
      ['/a-propos/responsabilite', '/about/responsibility'],
      ['/a-propos/medias-ressources', '/about/media-resources'],
      ['/a-propos/contact', '/about/contact'],
    ];

    for (const [source, destination] of legacyAboutRedirects) {
      redirects.push({ source, destination, permanent: true });
    }

    return redirects;
  },
};

export default withNextIntl(nextConfig);
