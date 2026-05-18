#!/usr/bin/env bash
# Install nginx site config for Africa Tourism Gate (Ubuntu/Debian).
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SITE_NAME="${SITE_NAME:-africatourismgate}"
CONF_DEST="/etc/nginx/sites-available/${SITE_NAME}"

WEB_CERT="/etc/letsencrypt/live/africatourismgate.org/fullchain.pem"
ADMIN_CERT="/etc/letsencrypt/live/app-africatourismgate.org/fullchain.pem"
API_CERT="/etc/letsencrypt/live/api.africatourismgate.org/fullchain.pem"
POS_CERT="/etc/letsencrypt/live/pos.africatourismgate.org/fullchain.pem"

has_cert() { [[ -f "$1" ]]; }

install_pos_snippet() {
  local dest="$1" src="$2"
  sudo mkdir -p /etc/nginx/snippets
  if has_cert "${POS_CERT}"; then
    sudo cp "${REPO_DIR}/nginx/snippets/${src}" "${dest}"
  else
    echo "# POS disabled (no cert for pos.africatourismgate.org)" | sudo tee "${dest}" >/dev/null
  fi
}

pick_config() {
  if has_cert "${WEB_CERT}" && has_cert "${ADMIN_CERT}" && has_cert "${API_CERT}"; then
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

echo "==> Removing old ATG nginx site links (africatourismgate + africatourismgate.conf)"
for link in /etc/nginx/sites-enabled/africatourismgate /etc/nginx/sites-enabled/africatourismgate.conf; do
  sudo rm -f "${link}"
done
sudo rm -f /etc/nginx/sites-available/africatourismgate.conf

echo "==> Installing ${CONF_DEST}"
sudo cp "${CONF_SRC}" "${CONF_DEST}"
sudo ln -sf "${CONF_DEST}" "/etc/nginx/sites-enabled/${SITE_NAME}"

if [[ "${CONF_SRC}" == *http-only* ]]; then
  install_pos_snippet /etc/nginx/snippets/atg-pos-servers-http.conf atg-pos-servers-http.conf
  echo "# unused in http-only main config" | sudo tee /etc/nginx/snippets/atg-pos-servers.conf >/dev/null
else
  install_pos_snippet /etc/nginx/snippets/atg-pos-servers.conf atg-pos-servers.conf
  echo "# unused in https main config" | sudo tee /etc/nginx/snippets/atg-pos-servers-http.conf >/dev/null
fi

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
  echo "SSL config failed (missing certificates?). Run:"
  echo "  sudo ./scripts/issue-ssl-certs.sh"
  echo "  sudo ./scripts/setup-nginx.sh"
  exit 1
fi

echo "==> Reloading nginx"
sudo systemctl enable nginx
sudo systemctl reload nginx

print_domain_row() {
  local role="$1" url="$2" host="$3" port="$4"
  printf "  %-22s %-42s → 127.0.0.1:%s\n" "${role}" "${url}" "${port}"
}

echo ""
echo "==> Domaines (ne pas inverser) :"
print_domain_row "Site public (web)" "https://africatourismgate.org" "africatourismgate.org" "3002"
print_domain_row "Admin (/login)" "https://app-africatourismgate.org/login" "app-africatourismgate.org" "3001"
print_domain_row "API" "https://api.africatourismgate.org/api" "api.africatourismgate.org" "3000"
print_domain_row "POS (optionnel)" "https://pos.africatourismgate.org" "pos.africatourismgate.org" "3003"

echo ""
echo "==> Quick tests:"
curl -sf -o /dev/null -w "  PM2 web  (3002): %{http_code}\n" "http://127.0.0.1:3002/" || echo "  PM2 web  (3002): failed (atg-web?)"
curl -sf -o /dev/null -w "  PM2 admin(3001): %{http_code}\n" "http://127.0.0.1:3001/login" || echo "  PM2 admin(3001): failed (atg-admin?)"
curl -sf -o /dev/null -w "  nginx web : %{http_code}\n" -H "Host: africatourismgate.org" "http://127.0.0.1/" 2>/dev/null || true
curl -sf -o /dev/null -w "  nginx admin: %{http_code}\n" -H "Host: app-africatourismgate.org" "http://127.0.0.1/login" 2>/dev/null || true
curl -sf -o /dev/null -w "  redirect /login on web: %{http_code}\n" -H "Host: africatourismgate.org" "http://127.0.0.1/login" 2>/dev/null || true

if has_cert "${ADMIN_CERT}"; then
  curl -sf -o /dev/null -w "  HTTPS admin: %{http_code}\n" "https://app-africatourismgate.org/login" 2>/dev/null \
    || echo "  HTTPS admin: failed"
fi
if has_cert "${WEB_CERT}"; then
  curl -sf -o /dev/null -w "  HTTPS web : %{http_code}\n" "https://africatourismgate.org/" 2>/dev/null \
    || echo "  HTTPS web : failed"
fi

echo ""
if [[ "${CONF_SRC}" == *http-only* ]]; then
  echo "Mode HTTP uniquement (certificats manquants)."
  echo "  sudo ./scripts/issue-ssl-certs.sh"
  echo "  sudo ./scripts/setup-nginx.sh"
fi

echo ""
echo "Done."
