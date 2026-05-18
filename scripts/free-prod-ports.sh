#!/usr/bin/env bash
# Free ports 3000–3003 on Linux (VPS). Use before restarting PM2 if you see EADDRINUSE.
set -euo pipefail

PORTS=(3000 3001 3002 3003)

echo "==> Stopping PM2 apps (if any)…"
if command -v pm2 >/dev/null 2>&1; then
  pm2 stop atg-api atg-web atg-admin atg-pos 2>/dev/null || true
fi

echo "==> Killing processes listening on API/Web/Admin/POS ports…"
for port in "${PORTS[@]}"; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  elif command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -ti ":${port}" 2>/dev/null || true)
    if [[ -n "${pids}" ]]; then
      kill -9 ${pids} 2>/dev/null || true
    fi
  else
    echo "Install lsof or psmisc (fuser). Skipping port ${port}." >&2
  fi
done

echo "==> Stopping orphan Node processes for this project…"
pkill -f "africatourismgate/apps/api/dist/main" 2>/dev/null || true
pkill -f "africatourismgate.*next start" 2>/dev/null || true
pkill -f "pnpm --filter @africatourismgate" 2>/dev/null || true
pkill -f "concurrently.*africatourismgate" 2>/dev/null || true

sleep 1

echo "==> Port status:"
for port in "${PORTS[@]}"; do
  if ss -tln "sport = :${port}" 2>/dev/null | grep -q LISTEN; then
    echo "  :${port} still in use:"
    ss -tlnp "sport = :${port}" 2>/dev/null || true
  else
    echo "  :${port} free"
  fi
done

echo "Done. Start apps with: pm2 start ecosystem.config.cjs --only atg-api,atg-web,atg-admin"
