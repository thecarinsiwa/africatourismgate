#!/usr/bin/env bash
# Install nginx site config for Africa Tourism Gate (Ubuntu/Debian).
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SITE_NAME="${SITE_NAME:-africatourismgate}"
CONF_SRC="${REPO_DIR}/nginx/africatourismgate.conf"
CONF_DEST="/etc/nginx/sites-available/${SITE_NAME}"

if [[ ! -f "${CONF_SRC}" ]]; then
  echo "Missing ${CONF_SRC}" >&2
  exit 1
fi

echo "==> Installing ${CONF_DEST}"
sudo cp "${CONF_SRC}" "${CONF_DEST}"
sudo ln -sf "${CONF_DEST}" "/etc/nginx/sites-enabled/${SITE_NAME}"

if [[ -f /etc/nginx/sites-enabled/default ]]; then
  echo "==> Disabling default nginx site (fixes 'Welcome to nginx' on subdomains)"
  sudo rm -f /etc/nginx/sites-enabled/default
fi

echo "==> Testing nginx configuration"
sudo nginx -t

echo "==> Reloading nginx"
sudo systemctl enable nginx
sudo systemctl reload nginx

echo ""
echo "==> Verify admin vhost (must show app-africatourismgate.org → port 3001):"
sudo nginx -T 2>/dev/null | grep -A2 'server_name app-africatourismgate' || true

echo ""
echo "Done. Ensure PM2 runs atg-admin, then open:"
echo "  http://app-africatourismgate.org  (before TLS)"
echo "  https://app-africatourismgate.org (after certbot)"
echo ""
echo "TLS (recommended):"
echo "  sudo apt install -y certbot python3-certbot-nginx"
echo "  sudo certbot --nginx \\"
echo "    -d africatourismgate.org -d www.africatourismgate.org \\"
echo "    -d app-africatourismgate.org -d www.app-africatourismgate.org \\"
echo "    -d api.africatourismgate.org \\"
echo "    -d pos.africatourismgate.org"
