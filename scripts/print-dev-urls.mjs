const ports = {
  api: process.env.API_PORT ?? '3000',
  admin: process.env.ADMIN_PORT ?? '3001',
  web: process.env.WEB_PORT ?? '3002',
  pos: process.env.POS_PORT ?? '3003',
};
const apiPrefix = process.env.API_GLOBAL_PREFIX ?? 'api';

console.log('');
console.log('Africa Tourism Gate — development URLs');
console.log('──────────────────────────────────────');
console.log(`  API     http://localhost:${ports.api}/${apiPrefix}`);
console.log(`          http://localhost:${ports.api}/${apiPrefix}/health`);
console.log(`  Admin   http://localhost:${ports.admin}`);
console.log('          Production: https://app-africatourismgate.org');
console.log(`  Web     http://localhost:${ports.web}`);
console.log(`  POS     http://localhost:${ports.pos}`);
console.log('');
