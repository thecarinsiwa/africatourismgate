/**
 * URL API locale pour le dev — alignée sur apps/api (API_PORT, défaut 3000).
 */
export function getDevApiPort() {
  const port = process.env.API_PORT?.trim();
  return port && /^\d+$/.test(port) ? port : '3000';
}

export function getDevApiUrl() {
  return `http://localhost:${getDevApiPort()}/api`;
}
