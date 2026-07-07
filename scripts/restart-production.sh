#!/usr/bin/env bash
# Clean restart: free ports, remove duplicate PM2 entries, start api + web + admin.
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "${REPO_DIR}"

echo "==> Clean restart (Africa Tourism Gate)…"

# Remove duplicate PM2 apps (e.g. atg-api id 4 and id 0)
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete atg-api atg-web atg-admin atg-pos atg-gap 2>/dev/null || true
  # Delete any stray pm2 apps matching our names
  pm2 jlist 2>/dev/null | node -e "
    const apps = JSON.parse(require('fs').readFileSync(0,'utf8')||'[]');
    for (const a of apps) {
      if (/^atg-/.test(a.name)) console.log(a.pm_id);
    }
  " 2>/dev/null | while read -r id; do
    [[ -n "${id}" ]] && pm2 delete "${id}" 2>/dev/null || true
  done
fi

bash "${REPO_DIR}/scripts/free-prod-ports.sh"

chmod +x "${REPO_DIR}"/scripts/pm2-start-*.sh "${REPO_DIR}"/scripts/free-prod-ports.sh

if [[ ! -d "${REPO_DIR}/apps/web/.next" ]] || [[ ! -d "${REPO_DIR}/apps/admin/.next" ]]; then
  echo "==> Missing Next.js build — running pnpm build…"
  (cd "${REPO_DIR}" && pnpm build)
fi

if [[ "${ATG_ENABLE_GAP:-0}" == "1" ]] && [[ ! -d "${REPO_DIR}/apps/gap/.next" ]]; then
  echo "==> Missing apps/gap build — running pnpm build…"
  (cd "${REPO_DIR}" && pnpm build)
fi

if [[ "${ATG_SKIP_DB_SYNC:-0}" == "1" ]]; then
  echo "==> Skipping database sync (ATG_SKIP_DB_SYNC=1)."
elif [[ "${ATG_DB_SYNC_ALREADY_RUN:-0}" == "1" ]]; then
  echo "==> Database sync already completed."
else
  echo "==> Synchronizing database…"
  pnpm db:sync
fi

echo "==> Starting PM2…"
PM2_ONLY="atg-api,atg-web,atg-admin"
if [[ "${ATG_ENABLE_POS:-0}" == "1" ]]; then
  PM2_ONLY="${PM2_ONLY},atg-pos"
fi
if [[ "${ATG_ENABLE_GAP:-0}" == "1" ]]; then
  PM2_ONLY="${PM2_ONLY},atg-gap"
fi
pm2 start "${REPO_DIR}/ecosystem.config.cjs" --only "${PM2_ONLY}"
pm2 save

sleep 2
pm2 status

echo ""
echo "==> Health checks:"
curl -sf "http://127.0.0.1:3000/api/health" && echo " API OK" || echo " API failed (check pm2 logs atg-api)"
curl -sf -o /dev/null "http://127.0.0.1:3001" && echo " Admin OK" || echo " Admin failed"
curl -sf -o /dev/null "http://127.0.0.1:3002" && echo " Web OK" || echo " Web failed"
if [[ "${ATG_ENABLE_GAP:-0}" == "1" ]]; then
  curl -sf -o /dev/null "http://127.0.0.1:3004" && echo " GAP OK" || echo " GAP failed"
fi
