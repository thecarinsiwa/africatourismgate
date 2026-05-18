#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}/apps/admin"
export NODE_ENV=production

if [[ ! -d .next ]]; then
  echo "Missing apps/admin/.next — run: cd ${ROOT} && pnpm build" >&2
  exit 1
fi

exec pnpm run start
