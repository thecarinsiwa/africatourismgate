#!/usr/bin/env bash
# Émet les certificats Let's Encrypt — un certificat par domaine (comme nginx/africatourismgate.conf).
# À lancer sur le VPS après que le DNS pointe vers ce serveur.
set -euo pipefail

echo "Africa Tourism Gate — certificats SSL par rôle"
echo ""
echo "  Site public : africatourismgate.org (+ www)"
echo "  Admin       : app-africatourismgate.org (+ www)  → /login"
echo "  API         : api.africatourismgate.org"
echo "  POS         : pos.africatourismgate.org (optionnel)"
echo ""

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot…"
  sudo apt-get update -qq
  sudo apt-get install -y -qq certbot python3-certbot-nginx
fi

issue() {
  local primary="$1"
  shift
  echo "==> certbot: ${primary} $*"
  sudo certbot certonly --nginx -d "${primary}" "$@" || {
    echo "Failed for ${primary}. Check DNS and: sudo certbot certonly --nginx -d ${primary}" >&2
    return 1
  }
}

issue africatourismgate.org -d www.africatourismgate.org
issue app-africatourismgate.org -d www.app-africatourismgate.org

echo ""
echo "==> API (nécessite un enregistrement DNS A : api → IP du VPS)"
issue api.africatourismgate.org || echo "==> API ignoré — configurez le DNS puis relancez certbot pour api."

echo ""
issue pos.africatourismgate.org || echo "==> POS ignoré (optionnel)."

echo ""
echo "==> Reinstall HTTPS nginx config:"
echo "  sudo ./scripts/setup-nginx.sh"
echo ""
echo "URLs:"
echo "  Web   https://africatourismgate.org/"
echo "  Admin https://app-africatourismgate.org/login"
