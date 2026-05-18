/**
 * PM2 production process manager for Africa Tourism Gate.
 *
 * Usage (on the VPS, from repo root after `pnpm build`):
 *   pm2 start ecosystem.config.cjs
 *   pm2 start ecosystem.config.cjs --only atg-api,atg-web,atg-admin
 *
 * Optional POS only:
 *   ATG_ENABLE_POS=1 pm2 start ecosystem.config.cjs --only atg-pos
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;

function resolveNextBin(appDir) {
  const candidates = [
    path.join(appDir, 'node_modules/next/dist/bin/next'),
    path.join(ROOT, 'node_modules/next/dist/bin/next'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `next binary not found for ${appDir}. Run pnpm install && pnpm build from the repo root.`,
  );
}

/** @param {string} appDir @param {number} port */
function nextApp(name, appDir, port) {
  return {
    name,
    cwd: appDir,
    script: resolveNextBin(appDir),
    args: ['start', '-p', String(port)],
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production' },
  };
}

/** @type {import('pm2').StartOptions[]} */
const apps = [
  {
    name: 'atg-api',
    cwd: path.join(ROOT, 'apps/api'),
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production' },
  },
  nextApp('atg-web', path.join(ROOT, 'apps/web'), 3002),
  nextApp('atg-admin', path.join(ROOT, 'apps/admin'), 3001),
];

if (process.env.ATG_ENABLE_POS === '1') {
  apps.push(nextApp('atg-pos', path.join(ROOT, 'apps/pos'), 3003));
}

module.exports = { apps };
