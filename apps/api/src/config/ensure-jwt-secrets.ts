import { Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const logger = new Logger('JwtSecretsBootstrap');

const PLACEHOLDER_SECRETS = new Set([
  'change-me-access',
  'change-me-refresh',
]);

const JWT_KEYS = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

function resolveRepoRoot(): string {
  const candidates = [
    join(__dirname, '../../../..'),
    join(process.cwd()),
    join(process.cwd(), '../..'),
  ];
  for (const root of candidates) {
    if (existsSync(join(root, 'database', 'africatourismgate_database.sql'))) {
      return root;
    }
    if (existsSync(join(root, '.env'))) {
      return root;
    }
  }
  return join(__dirname, '../../../..');
}

function isPlaceholderSecret(value: string | undefined): boolean {
  if (!value?.trim()) {
    return true;
  }
  return PLACEHOLDER_SECRETS.has(value.trim());
}

function generateSecret(): string {
  return randomBytes(48).toString('base64url');
}

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }
  const vars: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function applyEnvVars(vars: Record<string, string>): void {
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined && value !== '') {
      process.env[key] = value;
    }
  }
}

function persistJwtSecrets(
  envLocalPath: string,
  secrets: Record<(typeof JWT_KEYS)[number], string>,
): void {
  const lines = existsSync(envLocalPath)
    ? readFileSync(envLocalPath, 'utf8').split(/\r?\n/)
    : ['# Auto-generated JWT secrets (local dev only)'];
  const out: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const key = line.split('=')[0]?.trim();
    if (key && key in secrets) {
      out.push(`${key}=${secrets[key as keyof typeof secrets]}`);
      seen.add(key);
    } else {
      out.push(line);
    }
  }

  for (const key of JWT_KEYS) {
    if (!seen.has(key)) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      out.push(`${key}=${secrets[key]}`);
    }
  }

  writeFileSync(envLocalPath, `${out.join('\n').replace(/\n*$/, '\n')}`, 'utf8');
}

/**
 * Ensures JWT secrets exist before Nest ConfigModule boots.
 * Dev: generates cryptographically secure values and persists them to `.env.local`.
 * Production: requires explicit env vars (no placeholders).
 */
export function ensureJwtSecrets(): void {
  const repoRoot = resolveRepoRoot();
  const envPath = join(repoRoot, '.env');
  const envLocalPath = join(repoRoot, '.env.local');

  applyEnvVars(parseEnvFile(envPath));
  applyEnvVars(parseEnvFile(envLocalPath));

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    for (const key of JWT_KEYS) {
      if (isPlaceholderSecret(process.env[key])) {
        throw new Error(
          `${key} must be set to a strong random value in production`,
        );
      }
    }
    return;
  }

  let generated = false;
  const secrets: Record<(typeof JWT_KEYS)[number], string> = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? '',
  };

  for (const key of JWT_KEYS) {
    if (isPlaceholderSecret(secrets[key])) {
      secrets[key] = generateSecret();
      generated = true;
    }
  }

  process.env.JWT_ACCESS_SECRET = secrets.JWT_ACCESS_SECRET;
  process.env.JWT_REFRESH_SECRET = secrets.JWT_REFRESH_SECRET;

  if (generated) {
    persistJwtSecrets(envLocalPath, secrets);
    logger.log(
      `JWT secrets generated and saved to ${envLocalPath} (gitignored)`,
    );
  }
}
