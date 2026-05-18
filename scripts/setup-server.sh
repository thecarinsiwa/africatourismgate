#!/usr/bin/env bash
# Bootstrap a Linux VPS (Ubuntu/Debian) for Africa Tourism Gate production.
# Run as a user with sudo, from the cloned repo root:
#   chmod +x scripts/*.sh && ./scripts/setup-server.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
DEPLOY_USER="${DEPLOY_USER:-$USER}"
NODE_MAJOR="${NODE_MAJOR:-20}"

log() { printf '\n==> %s\n' "$*"; }
need_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1" >&2; exit 1; }; }

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This script targets Linux (VPS). For local dev use: pnpm dev" >&2
  exit 1
fi

log "Repository: ${REPO_DIR}"

log "Installing system packages (Node ${NODE_MAJOR}, nginx, build tools)…"
sudo apt-get update -qq
sudo apt-get install -y -qq curl git nginx mysql-client build-essential

if ! command -v node >/dev/null 2>&1 || [[ "$(node -p "process.versions.node.split('.')[0]")" -lt "${NODE_MAJOR}" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi

need_cmd node
need_cmd npm

log "Enabling pnpm via corepack…"
sudo corepack enable
corepack prepare pnpm@9.15.4 --activate
need_cmd pnpm

log "Installing PM2 globally…"
sudo npm install -g pm2
need_cmd pm2

cd "${REPO_DIR}"

if [[ ! -f .env ]]; then
  if [[ -f .env.production.example ]]; then
    cp .env.production.example .env
    log "Created .env from .env.production.example — edit it before going live."
  else
    echo "No .env found. Copy .env.example or .env.production.example to .env" >&2
    exit 1
  fi
fi

log "Installing dependencies and building apps…"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm build

log "Starting PM2 (API + web + admin)…"
pm2 delete atg-api atg-web atg-admin 2>/dev/null || true
pm2 start "${REPO_DIR}/ecosystem.config.cjs" --only atg-api,atg-web,atg-admin
pm2 save

log "PM2 startup on boot (run the command PM2 prints if needed)…"
pm2 startup systemd -u "${DEPLOY_USER}" --hp "${HOME}" || true

log "Done. Next steps:"
echo "  1. Edit ${REPO_DIR}/.env (database, JWT, NEXT_PUBLIC_API_URL, CORS_ORIGIN)"
echo "  2. Import MySQL schema if needed: mysql … < database/africatourismgate_database.sql"
echo "  3. Rebuild after URL changes: pnpm build && pm2 reload ecosystem.config.cjs"
echo "  4. Configure nginx: sudo ./scripts/setup-nginx.sh"
echo "  5. TLS: sudo certbot --nginx -d app-africatourismgate.org -d www.app-africatourismgate.org …"
echo "  6. Admin URL: https://app-africatourismgate.org (PM2: atg-admin on port 3001)"
echo "  7. Optional POS: ATG_ENABLE_POS=1 pm2 start ecosystem.config.cjs --only atg-pos"
echo ""
echo "  pm2 status"
echo "  pm2 logs atg-api"
