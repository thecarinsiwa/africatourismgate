#!/usr/bin/env bash
# Parse KEY=VALUE lines from a dotenv file without bash `source` (unsafe for unquoted emails/URLs).
load_dotenv() {
  local env_file="${1:-}"
  [[ -n "${env_file}" && -f "${env_file}" ]] || return 0

  if ! command -v node >/dev/null 2>&1; then
    echo "load_dotenv: node is required to parse ${env_file}" >&2
    return 1
  fi

  # shellcheck disable=SC2046
  eval "$(
    ENV_FILE="${env_file}" node <<'NODE'
const fs = require('node:fs');

const path = process.env.ENV_FILE;
if (!path) process.exit(0);
const text = fs.readFileSync(path, 'utf8');

for (const rawLine of text.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;

  const eq = line.indexOf('=');
  if (eq < 1) continue;

  const key = line.slice(0, eq).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

  let value = line.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  process.stdout.write(`export ${key}=${JSON.stringify(value)}\n`);
}
NODE
  )"
}
