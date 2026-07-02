import { isRemoteApiDev, getRemoteApiTargetUrl } from '../packages/config/remote-api-dev.mjs';

const ports = {
  api: process.env.API_PORT ?? '3000',
  admin: process.env.ADMIN_PORT ?? '3001',
  web: process.env.WEB_PORT ?? '3002',
  pos: process.env.POS_PORT ?? '3003',
};
const apiPrefix = process.env.API_GLOBAL_PREFIX ?? 'api';
const remoteApi = isRemoteApiDev();

console.log('');
console.log('Africa Tourism Gate — development URLs');
console.log('──────────────────────────────────────');
if (remoteApi) {
  const target = getRemoteApiTargetUrl();
  console.log(`  API     (remote) ${target}`);
  console.log(`          proxied via http://localhost:${ports.web}/${apiPrefix}`);
  console.log(`          and     http://localhost:${ports.admin}/${apiPrefix}`);
} else {
  console.log(`  API     http://localhost:${ports.api}/${apiPrefix}`);
  console.log(`          http://localhost:${ports.api}/${apiPrefix}/health`);
}
console.log(`  Admin   http://localhost:${ports.admin}/login`);
console.log('          Production: https://app-africatourismgate.org/login');
console.log(`  Web     http://localhost:${ports.web}/`);
console.log('          Production: https://africatourismgate.org/');
console.log(`  POS     http://localhost:${ports.pos}`);
if (remoteApi) {
  console.log('');
  console.log('  Remote API mode — run: pnpm dev:front');
}
console.log('');
