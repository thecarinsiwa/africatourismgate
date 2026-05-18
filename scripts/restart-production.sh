#!/usr/bin/env bash
# Clean restart: free ports, remove duplicate PM2 entries, start api + web + admin.
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "${REPO_DIR}"

echo "==> Clean restart (Africa Tourism Gate)…"

# Remove duplicate PM2 apps (e.g. atg-api id 4 and id 0)
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete atg-api atg-web atg-admin atg-pos 2>/dev/null || true
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

echo "==> Starting PM2…"
pm2 start "${REPO_DIR}/ecosystem.config.cjs" --only atg-api,atg-web,atg-admin
pm2 save

sleep 2
pm2 status

echo ""
echo "==> Health checks:"
curl -sf "http://127.0.0.1:3000/api/health" && echo " API OK" || echo " API failed (check pm2 logs atg-api)"
curl -sf -o /dev/null "http://127.0.0.1:3001" && echo " Admin OK" || echo " Admin failed"
curl -sf -o /dev/null "http://127.0.0.1:3002" && echo " Web OK" || echo " Web failed"
