#!/usr/bin/env bash
# Install nginx site config for Africa Tourism Gate (Ubuntu/Debian).
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SITE_NAME="${SITE_NAME:-africatourismgate}"
CONF_DEST="/etc/nginx/sites-available/${SITE_NAME}"
ADMIN_CERT="/etc/letsencrypt/live/app-africatourismgate.org/fullchain.pem"

pick_config() {
  if [[ -f "${ADMIN_CERT}" ]]; then
    echo "${REPO_DIR}/nginx/africatourismgate.conf"
  else
    echo "${REPO_DIR}/nginx/africatourismgate-http-only.conf"
  fi
}

CONF_SRC="$(pick_config)"

if [[ ! -f "${CONF_SRC}" ]]; then
  echo "Missing ${CONF_SRC}" >&2
  exit 1
fi

echo "==> Using nginx config: ${CONF_SRC}"
echo "==> Installing ${CONF_DEST}"
sudo cp "${CONF_SRC}" "${CONF_DEST}"
sudo ln -sf "${CONF_DEST}" "/etc/nginx/sites-enabled/${SITE_NAME}"

# Désactive les autres sites qui captent app-africatourismgate.org (souvent cause du 404 HTTPS)
for other in /etc/nginx/sites-enabled/*; do
  [[ -e "${other}" ]] || continue
  base="$(basename "${other}")"
  [[ "${base}" == "${SITE_NAME}" ]] && continue
  if sudo grep -q 'app-africatourismgate.org' "${other}" 2>/dev/null; then
    echo "==> Disabling conflicting site: ${base}"
    sudo rm -f "${other}"
  fi
done

if [[ -f /etc/nginx/sites-enabled/default ]]; then
  echo "==> Disabling default nginx site"
  sudo rm -f /etc/nginx/sites-enabled/default
fi

echo "==> Testing nginx configuration"
if ! sudo nginx -t; then
  echo ""
  echo "SSL config failed (missing certificates?). Try:"
  echo "  sudo certbot certonly --nginx -d app-africatourismgate.org"
  echo "  or use HTTP-only: sudo cp ${REPO_DIR}/nginx/africatourismgate-http-only.conf ${CONF_DEST} && sudo nginx -t && sudo systemctl reload nginx"
  exit 1
fi

echo "==> Reloading nginx"
sudo systemctl enable nginx
sudo systemctl reload nginx

echo ""
echo "==> Admin vhost (HTTPS):"
sudo nginx -T 2>/dev/null | grep -A6 'server_name app-africatourismgate' | head -20 || true

echo ""
echo "==> Quick tests:"
curl -sf -o /dev/null -w "HTTP  app : %{http_code}\n" "http://127.0.0.1:3001/login" || echo "HTTP  app : failed (PM2 atg-admin?)"
curl -sf -o /dev/null -w "HTTP  nginx: %{http_code}\n" -H "Host: app-africatourismgate.org" "http://127.0.0.1/login" 2>/dev/null || true
curl -sf -o /dev/null -w "HTTPS nginx: %{http_code}\n" "https://app-africatourismgate.org/login" 2>/dev/null || echo "HTTPS nginx: failed — run certbot if needed"

echo ""
if [[ ! -f "${ADMIN_CERT}" ]]; then
  echo "No SSL cert yet. After DNS points here:"
  echo "  sudo apt install -y certbot python3-certbot-nginx"
  echo "  sudo certbot --nginx -d app-africatourismgate.org -d www.app-africatourismgate.org"
  echo "  sudo ./scripts/setup-nginx.sh   # reinstall with HTTPS config"
fi

echo ""
echo "Done."
