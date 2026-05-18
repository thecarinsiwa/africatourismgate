#!/usr/bin/env bash
# Pull latest code, rebuild, and reload PM2 (run on the VPS from repo root).
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BRANCH="${BRANCH:-main}"

cd "${REPO_DIR}"

echo "==> Deploying ${REPO_DIR} (branch ${BRANCH})…"

if [[ -d .git ]]; then
  git fetch origin
  git checkout "${BRANCH}"
  git pull --ff-only origin "${BRANCH}"
fi

pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm build

if command -v pm2 >/dev/null 2>&1; then
  # reload can leave EADDRINUSE if an orphan still holds the port — prefer clean restart
  bash "${REPO_DIR}/scripts/restart-production.sh"
else
  echo "PM2 not installed. Run: ./scripts/setup-server.sh"
  exit 1
fi

echo "==> Deploy complete."
