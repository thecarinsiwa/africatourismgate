import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../../..');

export function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      // .env.local overrides shell + .env (e.g. API_PORT / NEXT_PUBLIC_API_URL)
      if (name === '.env.local' || !process.env[key]) {
        process.env[key] = m[2].trim();
      }
    }
  }
}
