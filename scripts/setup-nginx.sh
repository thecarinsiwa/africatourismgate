#!/usr/bin/env bash
set -euo pipefail
CONF_DIR="$(cd "$(dirname "$0")/../nginx" && pwd)"
echo "Copy nginx config from ${CONF_DIR} to /etc/nginx/sites-available/ (run with sudo on Linux)."
