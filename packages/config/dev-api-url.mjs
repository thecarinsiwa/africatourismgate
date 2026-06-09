/**
 * URL API locale pour le dev (évite le conflit PostgreSQL ↔ Nest sur :3000 sous Windows).
 */
export function getDevApiPort() {
  const port = process.env.API_PORT?.trim();
  return port && /^\d+$/.test(port) ? port : '3010';
}

export function getDevApiUrl() {
  return `http://localhost:${getDevApiPort()}/api`;
}
