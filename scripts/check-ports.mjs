import { execSync } from 'node:child_process';

const ports = [
  { name: 'API', port: process.env.API_PORT ?? '3000' },
  { name: 'Admin', port: process.env.ADMIN_PORT ?? '3001' },
  { name: 'Web', port: process.env.WEB_PORT ?? '3002' },
  { name: 'POS', port: process.env.POS_PORT ?? '3003' },
];

function portInUse(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return out.includes('LISTENING');
  } catch {
    return false;
  }
}

const busy = ports.filter(({ port }) => portInUse(port));

if (busy.length > 0) {
  console.warn('');
  console.warn('Warning: these ports are already in use:');
  for (const { name, port } of busy) {
    console.warn(`  - ${name} (:${port})`);
  }
  console.warn('');
  console.warn('Stop other dev servers (Ctrl+C) or free the port, e.g.:');
  console.warn('  netstat -ano | findstr :3000');
  console.warn('  taskkill /PID <pid> /F');
  console.warn('');
}
