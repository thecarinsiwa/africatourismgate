/**
 * PM2 production process manager for Africa Tourism Gate.
 *
 * Prerequisite: pnpm install && pnpm build (from repo root)
 *
 *   pm2 start ecosystem.config.cjs
 *   pm2 start ecosystem.config.cjs --only atg-api,atg-web,atg-admin
 */
const path = require('node:path');

const ROOT = __dirname;

/** @type {import('pm2').StartOptions} */
const base = {
  instances: 1,
  exec_mode: 'fork',
  autorestart: true,
  watch: false,
  max_memory_restart: '600M',
  env: { NODE_ENV: 'production' },
};

/** @type {import('pm2').StartOptions[]} */
const apps = [
  {
    ...base,
    name: 'atg-api',
    cwd: path.join(ROOT, 'apps/api'),
    script: 'dist/main.js',
    max_memory_restart: '512M',
  },
  {
    ...base,
    name: 'atg-web',
    script: path.join(ROOT, 'scripts/pm2-start-web.sh'),
    interpreter: 'bash',
  },
  {
    ...base,
    name: 'atg-admin',
    script: path.join(ROOT, 'scripts/pm2-start-admin.sh'),
    interpreter: 'bash',
  },
];

if (process.env.ATG_ENABLE_POS === '1') {
  apps.push({
    ...base,
    name: 'atg-pos',
    script: path.join(ROOT, 'scripts/pm2-start-pos.sh'),
    interpreter: 'bash',
  });
}

module.exports = { apps };
