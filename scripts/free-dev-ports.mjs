import { execSync } from 'node:child_process';

const ports = [
  process.env.API_PORT ?? '3000',
  process.env.ADMIN_PORT ?? '3001',
  process.env.WEB_PORT ?? '3002',
  process.env.POS_PORT ?? '3003',
];

function listeningPids(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
    }
    return [...pids];
  } catch {
    return [];
  }
}

let freed = 0;

for (const port of ports) {
  for (const pid of listeningPids(port)) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Freed :${port} (PID ${pid})`);
      freed += 1;
    } catch {
      // Process may have exited between netstat and taskkill
    }
  }
}

if (freed === 0) {
  console.log('Dev ports 3000–3003 are free');
}
