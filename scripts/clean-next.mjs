import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const apps = ['admin', 'web', 'pos'];

for (const app of apps) {
  const dir = join('apps', app, '.next');
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log('Cleared Next.js caches: admin, web, pos');
