#!/usr/bin/env bash
# Install nginx site config for Africa Tourism Gate (Ubuntu/Debian).
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SITE_NAME="${SITE_NAME:-africatourismgate}"
CONF_DEST="/etc/nginx/sites-available/${SITE_NAME}"

# HTTPS site public + admin requis ; API et POS optionnels (snippets)
REQUIRED_CERT_DOMAINS=(africatourismgate.org app-africatourismgate.org)
OPTIONAL_CERT_DOMAINS=(api.africatourismgate.org pos.africatourismgate.org)

live_dir_for() {
  local name="$1"
  if [[ -f "/etc/letsencrypt/live/${name}/fullchain.pem" ]]; then
    echo "${name}"
    return 0
  fi
  local alt
  alt=$(find /etc/letsencrypt/live -maxdepth 1 -type d -name "${name}-*" 2>/dev/null | head -1 || true)
  if [[ -n "${alt}" && -f "${alt}/fullchain.pem" ]]; then
    basename "${alt}"
    return 0
  fi
  return 1
}

has_cert_for() { live_dir_for "$1" >/dev/null 2>&1; }

install_snippet() {
  local dest="$1" src="$2" enabled="$3"
  sudo mkdir -p /etc/nginx/snippets
  if [[ "${enabled}" == "1" ]]; then
    sudo cp "${REPO_DIR}/nginx/snippets/${src}" "${dest}"
  else
    echo "# disabled — no certificate" | sudo tee "${dest}" >/dev/null
  fi
}

pick_config() {
  local ok=1
  for d in "${REQUIRED_CERT_DOMAINS[@]}"; do
    has_cert_for "${d}" || ok=0
  done
  if [[ "${ok}" -eq 1 ]]; then
    echo "${REPO_DIR}/nginx/africatourismgate.conf"
  else
    echo "${REPO_DIR}/nginx/africatourismgate-http-only.conf"
  fi
}

patch_ssl_live_paths() {
  local file="$1"
  shift
  for domain in "$@"; do
    local live
    live=$(live_dir_for "${domain}") || continue
    if [[ "${live}" != "${domain}" ]]; then
      sudo sed -i "s|/etc/letsencrypt/live/${domain}/|/etc/letsencrypt/live/${live}/|g" "${file}"
      echo "==> SSL cert path: ${domain} → live/${live}"
    fi
  done
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
  install_snippet /etc/nginx/snippets/atg-api-servers-http.conf atg-api-servers-http.conf 1
  install_snippet /etc/nginx/snippets/atg-pos-servers-http.conf atg-pos-servers-http.conf \
    "$(has_cert_for pos.africatourismgate.org && echo 1 || echo 0)"
  echo "# unused in http-only main config" | sudo tee /etc/nginx/snippets/atg-api-servers.conf >/dev/null
  echo "# unused in http-only main config" | sudo tee /etc/nginx/snippets/atg-pos-servers.conf >/dev/null
else
  install_snippet /etc/nginx/snippets/atg-api-servers.conf atg-api-servers.conf \
    "$(has_cert_for api.africatourismgate.org && echo 1 || echo 0)"
  install_snippet /etc/nginx/snippets/atg-pos-servers.conf atg-pos-servers.conf \
    "$(has_cert_for pos.africatourismgate.org && echo 1 || echo 0)"
  echo "# unused in https main config" | sudo tee /etc/nginx/snippets/atg-api-servers-http.conf >/dev/null
  echo "# unused in https main config" | sudo tee /etc/nginx/snippets/atg-pos-servers-http.conf >/dev/null
  patch_ssl_live_paths "${CONF_DEST}" africatourismgate.org app-africatourismgate.org
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
  echo "SSL config failed. Run: sudo ./scripts/issue-ssl-certs.sh && sudo ./scripts/setup-nginx.sh"
  exit 1
fi

echo "==> Reloading nginx"
sudo systemctl enable nginx
sudo systemctl reload nginx

print_domain_row() {
  local role="$1" url="$2" port="$3"
  printf "  %-22s %-42s → 127.0.0.1:%s\n" "${role}" "${url}" "${port}"
}

echo ""
echo "==> Domaines (ne pas inverser) :"
print_domain_row "Site public (web)" "https://africatourismgate.org" "3002"
print_domain_row "Admin (/login)" "https://app-africatourismgate.org/login" "3001"
print_domain_row "API" "https://api.africatourismgate.org/api" "3000"
print_domain_row "POS (optionnel)" "https://pos.africatourismgate.org" "3003"

echo ""
echo "==> Certificats Let's Encrypt :"
for d in "${REQUIRED_CERT_DOMAINS[@]}"; do
  if has_cert_for "${d}"; then
    echo "  OK (requis)  ${d} → live/$(live_dir_for "${d}")"
  else
    echo "  MANQUANT     ${d}"
  fi
done
for d in "${OPTIONAL_CERT_DOMAINS[@]}"; do
  if has_cert_for "${d}"; then
    echo "  OK (opt.)    ${d}"
  else
    echo "  absent       ${d} (optionnel)"
  fi
done

echo ""
echo "==> Quick tests:"
curl -sf -o /dev/null -w "  PM2 web  (3002): %{http_code}\n" "http://127.0.0.1:3002/" || echo "  PM2 web  (3002): failed (atg-web?)"
curl -sf -o /dev/null -w "  PM2 admin(3001): %{http_code}\n" "http://127.0.0.1:3001/login" || echo "  PM2 admin(3001): failed (atg-admin?)"
curl -sf -o /dev/null -w "  nginx web : %{http_code}\n" -H "Host: africatourismgate.org" "http://127.0.0.1/" 2>/dev/null || true
curl -sf -o /dev/null -w "  nginx admin: %{http_code}\n" -H "Host: app-africatourismgate.org" "http://127.0.0.1/login" 2>/dev/null || true
curl -sf -o /dev/null -w "  redirect /login on web: %{http_code}\n" -H "Host: africatourismgate.org" "http://127.0.0.1/login" 2>/dev/null || true

if [[ "${CONF_SRC}" != *http-only* ]]; then
  curl -sf -o /dev/null -w "  HTTPS admin: %{http_code}\n" "https://app-africatourismgate.org/login" 2>/dev/null \
    || echo "  HTTPS admin: failed"
  curl -sf -o /dev/null -w "  HTTPS web : %{http_code}\n" "https://africatourismgate.org/" 2>/dev/null \
    || echo "  HTTPS web : failed"
else
  echo "  HTTPS admin: — (mode HTTP uniquement)"
  echo "  HTTPS web : — (mode HTTP uniquement)"
fi

echo ""
if [[ "${CONF_SRC}" == *http-only* ]]; then
  echo "Mode HTTP uniquement : certificats web + admin requis pour HTTPS."
  echo "  sudo ./scripts/issue-ssl-certs.sh"
  echo "  sudo ./scripts/setup-nginx.sh"
  if ! has_cert_for api.africatourismgate.org; then
    echo ""
    echo "API : ajoutez un enregistrement DNS A pour api.africatourismgate.org → IP du VPS,"
    echo "      attendez la propagation, puis : sudo certbot certonly --nginx -d api.africatourismgate.org"
  fi
fi

echo ""
echo "Done."
