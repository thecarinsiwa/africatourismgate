/**
 * Production hostnames — keep in sync with nginx/africatourismgate*.conf
 *
 * | Rôle        | URL production                         | App PM2    | Port |
 * |-------------|----------------------------------------|------------|------|
 * | Site public | https://africatourismgate.org          | atg-web    | 3002 |
 * | Admin       | https://app-africatourismgate.org      | atg-admin  | 3001 |
 * | API         | https://api.africatourismgate.org/api  | atg-api    | 3000 |
 * | POS         | https://pos.africatourismgate.org      | atg-pos    | 3003 |
 */

export const ATG_DOMAINS = {
  web: {
    host: 'africatourismgate.org',
    hosts: ['africatourismgate.org', 'www.africatourismgate.org'],
    url: 'https://africatourismgate.org',
    pm2: 'atg-web',
    port: 3002,
    label: 'Site public (apps/web)',
  },
  admin: {
    host: 'app-africatourismgate.org',
    hosts: ['app-africatourismgate.org', 'www.app-africatourismgate.org'],
    url: 'https://app-africatourismgate.org',
    loginUrl: 'https://app-africatourismgate.org/login',
    pm2: 'atg-admin',
    port: 3001,
    label: 'Back-office admin (apps/admin)',
  },
  api: {
    host: 'api.africatourismgate.org',
    hosts: ['api.africatourismgate.org'],
    url: 'https://api.africatourismgate.org/api',
    pm2: 'atg-api',
    port: 3000,
    label: 'API NestJS (apps/api)',
  },
  pos: {
    host: 'pos.africatourismgate.org',
    hosts: ['pos.africatourismgate.org'],
    url: 'https://pos.africatourismgate.org',
    pm2: 'atg-pos',
    port: 3003,
    label: 'Point de vente (apps/pos, optionnel)',
  },
};

/** Chemins réservés à l’admin — redirigés depuis le site public en production. */
export const ADMIN_ONLY_PATHS = ['/login'];
